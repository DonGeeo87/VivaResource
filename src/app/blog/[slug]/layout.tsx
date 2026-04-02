export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <div className="min-h-screen">{children}</div>;
}
