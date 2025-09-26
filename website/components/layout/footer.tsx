import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-white mb-4">Academics</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/academics/faculties" className="hover:text-white transition-colors">Faculties & Schools</Link></li>
              <li><Link href="/academics/departments" className="hover:text-white transition-colors">Departments</Link></li>
              <li><Link href="/academics/undergraduate" className="hover:text-white transition-colors">Undergraduate</Link></li>
              <li><Link href="/academics/graduate" className="hover:text-white transition-colors">Graduate</Link></li>
              <li><Link href="/academics/courses" className="hover:text-white transition-colors">Course Catalog</Link></li>
              <li><Link href="/academics/calendar" className="hover:text-white transition-colors">Academic Calendar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Admissions</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admissions/apply" className="hover:text-white transition-colors">How to Apply</Link></li>
              <li><Link href="/admissions/undergraduate" className="hover:text-white transition-colors">Undergraduate</Link></li>
              <li><Link href="/admissions/graduate" className="hover:text-white transition-colors">Graduate</Link></li>
              <li><Link href="/admissions/international" className="hover:text-white transition-colors">International Students</Link></li>
              <li><Link href="/admissions/financial-aid" className="hover:text-white transition-colors">Financial Aid</Link></li>
              <li><Link href="/admissions/visit" className="hover:text-white transition-colors">Visit Campus</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Campus Life</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/campus-life/housing" className="hover:text-white transition-colors">Housing & Dining</Link></li>
              <li><Link href="/campus-life/activities" className="hover:text-white transition-colors">Student Activities</Link></li>
              <li><Link href="/campus-life/athletics" className="hover:text-white transition-colors">Athletics</Link></li>
              <li><Link href="/campus-life/health" className="hover:text-white transition-colors">Health Services</Link></li>
              <li><Link href="/campus-life/safety" className="hover:text-white transition-colors">Campus Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="http://localhost:5174" className="hover:text-white transition-colors">Student Portal</Link></li>
              <li><Link href="http://localhost:5174" className="hover:text-white transition-colors">Faculty/Staff Portal</Link></li>
              <li><Link href="/library" className="hover:text-white transition-colors">Library</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Events Calendar</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-white" />
            <span className="font-bold text-white">Mindswim College</span>
          </div>

          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>

          <div className="text-sm">
            © {new Date().getFullYear()} Mindswim College. All rights reserved.
          </div>
        </div>

        <div className="mt-8 text-center text-sm">
          <p>160 Convent Avenue, New York, NY 10031</p>
          <p>Phone: (212) 650-7000</p>
        </div>
      </div>
    </footer>
  )
}