import Link from "next/link";

interface BackLinkProps {
  href: string;
  label: string;
}

export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <div className="container topnav">
      <Link className="backlink" href={href}>
        <span className="arrow">←</span> {label}
      </Link>
    </div>
  );
}
