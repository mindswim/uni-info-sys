"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const academics = [
  {
    title: "Faculties & Schools",
    href: "/academics/faculties",
    description: "Our six academic divisions"
  },
  {
    title: "Departments",
    href: "/academics/departments",
    description: "Academic departments and programs"
  },
  {
    title: "Programs",
    href: "/academics/programs",
    description: "Browse all degree programs"
  },
  {
    title: "Academic Calendar",
    href: "/academics/calendar",
    description: "Important dates and deadlines"
  },
]

const admissions = [
  {
    title: "How to Apply",
    href: "/admissions/apply",
    description: "Application process and requirements"
  },
  {
    title: "Undergraduate",
    href: "/admissions/undergraduate",
    description: "First-year and transfer students"
  },
  {
    title: "Graduate",
    href: "/admissions/graduate",
    description: "Master's and doctoral programs"
  },
  {
    title: "International Students",
    href: "/admissions/international",
    description: "Resources for international applicants"
  },
  {
    title: "Financial Aid",
    href: "/admissions/financial-aid",
    description: "Scholarships and funding options"
  },
  {
    title: "Visit Campus",
    href: "/admissions/visit",
    description: "Tours and information sessions"
  },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <span className="font-bold text-xl">Mindswim College</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/about" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger onClick={() => window.location.href = '/academics'}>
                Academics
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] md:grid-cols-1">
                  {academics.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger onClick={() => window.location.href = '/admissions'}>
                Admissions
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] md:grid-cols-1">
                  {admissions.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger onClick={() => window.location.href = '/campus-life'}>
                Campus Life
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] md:grid-cols-1">
                  <ListItem
                    title="Housing & Dining"
                    href="/campus-life/housing"
                  >
                    Residence halls and meal plans
                  </ListItem>
                  <ListItem
                    title="Student Activities"
                    href="/campus-life/activities"
                  >
                    Clubs, organizations, and events
                  </ListItem>
                  <ListItem
                    title="Athletics & Recreation"
                    href="/campus-life/athletics"
                  >
                    Sports teams and fitness facilities
                  </ListItem>
                  <ListItem
                    title="Health & Wellness"
                    href="/campus-life/health"
                  >
                    Medical and counseling services
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/research" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Research
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="http://localhost:5174">Student Portal</Link>
          </Button>
          <Button asChild>
            <Link href="http://localhost:5174/apply">Apply Now</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

const ListItem = ({ className, title, children, href, ...props }: any) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </li>
  )
}