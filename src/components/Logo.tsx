export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#12121a"/>
      <rect x="8" y="6" width="4.5" height="28" rx="2" fill="var(--acc,#e63946)"/>
      <rect x="8" y="6" width="18" height="4.5" rx="2" fill="var(--acc,#e63946)"/>
      <rect x="8" y="16" width="13" height="4" rx="2" fill="var(--acc,#e63946)" opacity="0.75"/>
      <circle cx="30" cy="11" r="3" fill="var(--gold,#f4a030)" opacity="0.9"/>
    </svg>
  );
}
