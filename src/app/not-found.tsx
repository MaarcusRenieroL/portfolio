export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-sm text-muted-foreground">
          this page doesn’t exist
        </p>
      </div>
    </div>
  );
}
