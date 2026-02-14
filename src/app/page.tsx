import { Button } from "@/shared/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">mycms</h1>
      <p className="text-muted-foreground">Open source headless CMS</p>
      <div className="flex gap-4">
        <Button asChild>
          <a href="/sign-in">Sign In</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/sign-up">Sign Up</a>
        </Button>
      </div>
    </div>
  );
}
