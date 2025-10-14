interface PMWLogoProps {
  className?: string;
  size?: number;
}

export function PMWLogo({ className = "", size = 40 }: PMWLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 55 55" 
      fill="none"
      className={className}
      suppressHydrationWarning
    >
      <g clipPath="url(#clip0_2651_2626)">
        <path d="M28.1803 22.3618L25.4737 26.7473L22.7816 22.3618H19.4671V33.6947H22.5355V27.225L25.4158 31.625H25.4737L28.3684 27.196V33.6947H31.4947V22.3763H28.1803V22.3618Z" fill="white" suppressHydrationWarning></path>
        <path d="M13.8658 22.3618H9.0171V27.9921H8.17763V30.4526H9.0171V33.6802H12.1579V30.4381H13.7066C16.5145 30.4381 18.5697 29.0342 18.5697 26.3566V26.3421C18.5842 23.8381 16.7316 22.3618 13.8658 22.3618ZM15.4434 26.5302C15.4434 27.4131 14.7632 28.0066 13.6487 28.0066H12.1579V25.0105H13.6342C14.7632 25.0105 15.4434 25.5316 15.4434 26.5013V26.5302Z" fill="white" suppressHydrationWarning></path>
        <path d="M44.9553 22.3618L43.3053 27.5579L41.3368 22.3329H38.8908L36.9224 27.5145L35.475 22.3618H32.1895H32.175H32.1605L35.5618 33.6947H38.0368L40.0776 27.225L42.1329 33.6947H44.5934L45.2737 31.4803L48.0092 22.3618H44.9553Z" fill="white" suppressHydrationWarning></path>
        <path d="M55 27.5C55 12.3171 42.6829 0 27.5 0C12.3171 0 0 12.3171 0 27.5C0 42.6829 12.3171 55 27.5 55C42.6829 55 55 42.6974 55 27.5ZM51.8158 27.5145C51.8158 40.9461 40.9316 51.8303 27.5 51.8303C14.0684 51.8303 3.18421 40.9461 3.18421 27.5145C3.18421 14.0829 14.0684 3.18421 27.5 3.18421C40.9316 3.18421 51.8158 14.0684 51.8158 27.5145Z" fill="white" suppressHydrationWarning></path>
      </g>
      <defs>
        <clipPath id="clip0_2651_2626">
          <rect width="55" height="55" fill="white" suppressHydrationWarning></rect>
        </clipPath>
      </defs>
    </svg>
  );
}