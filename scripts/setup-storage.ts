/**
 * Setup Supabase Storage for Documents
 *
 * Run this script once to create the documents bucket:
 * npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...')
  console.log('   Supabase URL:', supabaseUrl)

  try {
    // Check if bucket already exists
    const { data: existingBuckets } = await supabase.storage.listBuckets()
    const bucketExists = existingBuckets?.some(b => b.name === 'documents')

    if (bucketExists) {
      console.log('✅ Bucket "documents" already exists')
      return
    }

    // Create documents bucket
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: false, // Private bucket (requires auth)
      fileSizeLimit: 52428800, // 50MB (Supabase free tier limit)
      allowedMimeTypes: [
        'application/pdf',
        'text/plain',
        'text/markdown',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    })

    if (error) {
      console.error('❌ Error creating bucket:', error)
      process.exit(1)
    }

    console.log('✅ Bucket "documents" created successfully')
    console.log('   Settings:')
    console.log('   - Public: false (requires authentication)')
    console.log('   - Max file size: 50MB (Supabase free tier)')
    console.log('   - Allowed types: PDF, TXT, MD, CSV, DOCX')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

setupStorage()
