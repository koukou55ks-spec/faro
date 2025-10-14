import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Faro'
    const description = searchParams.get('description') || 'Your lifelong financial thinking partner'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#8B5CF6',
            backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            fontFamily: 'system-ui',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: 30,
              backgroundColor: 'white',
              marginBottom: 40,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <svg
              width="70"
              height="70"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="#8B5CF6"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: 'white',
              marginBottom: 20,
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: '80%',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
