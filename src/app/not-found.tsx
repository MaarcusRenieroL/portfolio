export default function NotFound() {
  return (
    <div className="flex items-center justify-center text-center h-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-sm text-muted-foreground">this page doesn’t exist</p>
      </div>
    </div>
  );
}
