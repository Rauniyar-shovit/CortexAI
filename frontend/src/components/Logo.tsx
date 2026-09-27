const Logo = ({ size = 34 }: { size?: number }) => (
  <div
    className="relative shrink-0 rounded-full bg-ink"
    style={{ width: size, height: size }}
  >
    <div
      className="absolute rounded-full bg-ac"
      style={{
        top: size * 0.235,
        left: size * 0.265,
        width: size * 0.3,
        height: size * 0.3,
      }}
    />
  </div>
);

export default Logo;
