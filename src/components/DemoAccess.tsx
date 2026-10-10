import { Link } from '@tanstack/react-router';
import { GraduationCap, Users, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoAccess() {
  return <section aria-label="Test demo access" className="mx-auto mt-8 max-w-xl border-y py-6">
    <h2 className="text-center text-xl font-semibold">Try a test workspace</h2>
    <p className="mt-2 text-center text-sm text-muted-foreground">Fictional records only · No password needed · No access to private accounts</p>
    <div className="mt-5 grid gap-3">
      <Button asChild variant="outline" className="h-auto justify-between py-3"><Link to="/student"><span className="flex items-center gap-3"><GraduationCap /><span className="text-left">Student demo<span className="block text-xs text-muted-foreground">student@test.com · Demo identity only</span></span></span><ArrowRight /></Link></Button>
      <Button asChild variant="outline" className="h-auto justify-between py-3"><Link to="/faculty"><span className="flex items-center gap-3"><Users /><span className="text-left">Teacher demo<span className="block text-xs text-muted-foreground">faculty@test.com · Demo identity only</span></span></span><ArrowRight /></Link></Button>
      <Button asChild variant="outline" className="h-auto justify-between py-3"><Link to="/admin"><span className="flex items-center gap-3"><Building2 /><span className="text-left">Admin demo<span className="block text-xs text-muted-foreground">admin@test.com · Demo identity only</span></span></span><ArrowRight /></Link></Button>
    </div>
  </section>;
}