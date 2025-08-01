import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string
    const culturalTags = JSON.parse(formData.get('culturalTags') as string || '[]')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`
    const filePath = `user-uploads/${user.id}/${filename}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath)

    const imageUrl = urlData.publicUrl

    // Store upload record
    const { data: uploadRecord, error: dbError } = await supabase
      .from('secure_uploads')
      .insert({
        id: uuidv4(),
        user_id: user.id,
        filename: file.name,
        file_path: filePath,
        file_url: imageUrl,
        file_size: file.size,
        file_type: file.type,
        item_id: itemId || null,
        cultural_tags: culturalTags,
        upload_status: 'uploaded',
        scan_status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('item-images').remove([filePath])
      return NextResponse.json({ error: 'Failed to record upload' }, { status: 500 })
    }

    // Start background content analysis
    // In a real implementation, this would be done via a queue system
    setTimeout(() => {
      analyzeUploadedImage(uploadRecord.id, imageUrl, culturalTags)
    }, 1000)

    return NextResponse.json({
      id: uploadRecord.id,
      url: imageUrl,
      filename: file.name,
      message: 'Upload successful, starting content analysis'
    })

  } catch (error) {
    console.error('Secure upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

function validateFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return 'File type not supported. Please use JPG, PNG, GIF, or WebP.'
  }

  if (file.size > maxSize) {
    return 'File size too large. Maximum size is 10MB.'
  }

  if (file.size < 1024) {
    return 'File size too small. Minimum size is 1KB.'
  }

  return null
}

async function analyzeUploadedImage(uploadId: string, imageUrl: string, culturalTags: string[]) {
  try {
    const supabase = createClient()

    // Update scan status
    await supabase
      .from('secure_uploads')
      .update({ scan_status: 'analyzing' })
      .eq('id', uploadId)

    // Perform content analysis
    const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/trust-safety/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, itemId: uploadId })
    })

    const contentAnalysis = await contentResponse.json()

    // Perform cultural analysis if tags provided
    let culturalAnalysis = null
    if (culturalTags.length > 0) {
      const culturalResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/trust-safety/analyze-cultural-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, culturalTags })
      })
      culturalAnalysis = await culturalResponse.json()
    }

    // Update upload record with analysis results
    const scanResults = {
      content_safe: contentAnalysis.result?.confidence < 0.8,
      content_confidence: contentAnalysis.result?.confidence || 0,
      content_flags: contentAnalysis.result?.flags || [],
      cultural_risk_score: culturalAnalysis?.appropriationRisk || 0,
      cultural_recommendations: culturalAnalysis?.recommendations || [],
      scan_completed_at: new Date().toISOString()
    }

    await supabase
      .from('secure_uploads')
      .update({
        scan_status: 'completed',
        scan_results: scanResults,
        ...scanResults
      })
      .eq('id', uploadId)

    // If content is flagged, notify moderators
    if (!scanResults.content_safe || scanResults.cultural_risk_score > 0.7) {
      await supabase
        .from('moderation_queue')
        .insert({
          item_type: 'image_upload',
          item_id: uploadId,
          priority: scanResults.cultural_risk_score > 0.8 ? 'high' : 'medium',
          status: 'pending',
          metadata: {
            image_url: imageUrl,
            scan_results: scanResults
          }
        })
    }

  } catch (error) {
    console.error('Image analysis error:', error)
    
    // Update scan status to failed
    const supabase = createClient()
    await supabase
      .from('secure_uploads')
      .update({ 
        scan_status: 'failed',
        scan_error: error instanceof Error ? error.message : 'Analysis failed'
      })
      .eq('id', uploadId)
  }
}