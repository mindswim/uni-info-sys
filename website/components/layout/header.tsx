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
    description: "Explore our seven academic divisions"
  },
  {
    title: "Departments",
    href: "/academics/departments",
    description: "Academic departments and programs"
  },
  {
    title: "Undergraduate Programs",
    href: "/academics/undergraduate",
    description: "Bachelor's degree programs"
  },
  {
    title: "Graduate Programs",
    href: "/academics/graduate",
    description: "Master's and doctoral programs"
  },
  {
    title: "Course Catalog",
    href: "/academics/courses",
    description: "Browse all available courses"
  },
  {
    title: "Academic Calendar",
    href: "/academics/calendar",
    description: "Important academic dates"
  },
]

const admissions = [
  {
    title: "How to Apply",
    href: "/admissions/apply",
    description: "Application process and requirements"
  },
  {
    title: "Undergraduate Admissions",
    href: "/admissions/undergraduate",
    description: "First-year and transfer students"
  },
  {
    title: "Graduate Admissions",
    href: "/admissions/graduate",
    description: "Advanced degree programs"
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
              <NavigationMenuTrigger>Academics</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[500px] md:grid-cols-2">
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
              <NavigationMenuTrigger>Admissions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[500px] md:grid-cols-2">
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
              <NavigationMenuLink asChild>
                <Link href="/campus-life" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Campus Life
                </Link>
              </NavigationMenuLink>
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