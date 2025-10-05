import type { SVGProps } from "react";

export function ClaasLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 16.5c-2.4 1.5-4.43 2.5-6.5 2.5-2.8 0-5-2.2-5-5s2.2-5 5-5c2.07 0 4.1.99 6.5 2.5" />
      <path d="M15.5 16.5V7.5" />
      <path d="M15.5 12h5" />
    </svg>
  );
}

export function Spinner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={`animate-spin ${props.className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export function TractorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 4.5v9" />
      <path d="M18 4.5v9" />
      <path d="M3 9h18" />
      <path d="M3 13.5h4" />
      <path d="M7 13.5v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      <path d="m15 13.5.5-3" />
      <path d="M15.5 10.5H18" />
      <path d="M9 13.5V18a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-4.5" />
    </svg>
  )
}
    
