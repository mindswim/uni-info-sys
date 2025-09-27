"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Info, XCircle, Home, User, Settings, Bell, Search, Heart, Star, Mail } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"

export default function StyleGuidePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [progress, setProgress] = useState(60)
  const { variant } = useTheme()

  const colorPalette = [
    { name: "Primary", class: "bg-primary", textClass: "text-primary-foreground" },
    { name: "Secondary", class: "bg-secondary", textClass: "text-secondary-foreground" },
    { name: "Accent", class: "bg-accent", textClass: "text-accent-foreground" },
    { name: "Muted", class: "bg-muted", textClass: "text-muted-foreground" },
    { name: "Success", class: "bg-success-600", textClass: "text-white" },
    { name: "Warning", class: "bg-warning-600", textClass: "text-white" },
    { name: "Danger", class: "bg-danger-600", textClass: "text-white" },
    { name: "Info", class: "bg-info-600", textClass: "text-white" },
  ]

  const spacingValues = [
    { name: "0", value: "0", class: "p-0" },
    { name: "1", value: "0.25rem", class: "p-1" },
    { name: "2", value: "0.5rem", class: "p-2" },
    { name: "4", value: "1rem", class: "p-4" },
    { name: "6", value: "1.5rem", class: "p-6" },
    { name: "8", value: "2rem", class: "p-8" },
    { name: "10", value: "2.5rem", class: "p-10" },
    { name: "12", value: "3rem", class: "p-12" },
  ]

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Component Style Guide</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive design system documentation for the University Information System
        </p>
        <Badge variant="secondary" className="mt-2">
          Current Theme: {variant}
        </Badge>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Colors Section */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Theme-aware color system with semantic meaning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {colorPalette.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div className={`${color.class} ${color.textClass} rounded-lg p-4 h-20 flex items-center justify-center font-medium`}>
                      {color.name}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">{color.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>Consistent spacing values based on 4px grid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {spacingValues.map((spacing) => (
                  <div key={spacing.name} className="flex items-center gap-4">
                    <span className="text-sm font-mono w-8">{spacing.name}</span>
                    <div className={`bg-primary ${spacing.class} rounded`}>
                      <div className="bg-background/90 px-2 py-1 rounded text-sm">
                        {spacing.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Section */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Modular scale for consistent typography</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                  Heading 1
                </h1>
                <p className="text-sm text-muted-foreground">text-4xl / font-extrabold</p>
              </div>
              <div>
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                  Heading 2
                </h2>
                <p className="text-sm text-muted-foreground">text-3xl / font-semibold</p>
              </div>
              <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Heading 3
                </h3>
                <p className="text-sm text-muted-foreground">text-2xl / font-semibold</p>
              </div>
              <div>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Heading 4
                </h4>
                <p className="text-sm text-muted-foreground">text-xl / font-semibold</p>
              </div>
              <div>
                <p className="leading-7">
                  Regular paragraph text with standard line height for optimal readability.
                </p>
                <p className="text-sm text-muted-foreground">text-base / leading-7</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Muted text for secondary content and descriptions.
                </p>
                <p className="text-sm text-muted-foreground">text-sm / text-muted-foreground</p>
              </div>
              <div>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  Inline code
                </code>
                <p className="text-sm text-muted-foreground mt-1">font-mono / text-sm</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buttons Section */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles for various actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>Consistent sizing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
              <CardDescription>Interactive states and loading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button className="btn hover-lift">Hover Lift</Button>
                <Button className="btn hover-scale">Hover Scale</Button>
                <Button className="btn hover-glow">Hover Glow</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Section */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and form controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text-input">Text Input</Label>
                <Input id="text-input" placeholder="Enter text..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="label-required">Email (Required)</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea">Textarea</Label>
                <Textarea id="textarea" placeholder="Enter description..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="select">Select</Label>
                <Select>
                  <SelectTrigger id="select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox" />
                <Label htmlFor="checkbox">Accept terms and conditions</Label>
              </div>

              <div className="space-y-2">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="switch" />
                <Label htmlFor="switch">Enable notifications</Label>
              </div>

              <div className="space-y-2">
                <Label>Slider</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Section */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status and category indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="badge-success">Success</Badge>
                <Badge className="badge-warning">Warning</Badge>
                <Badge className="badge-danger">Danger</Badge>
                <Badge className="badge-info">Info</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Contextual feedback messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>This is a default alert message.</AlertDescription>
              </Alert>

              <Alert className="alert-success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>Operation completed successfully.</AlertDescription>
              </Alert>

              <Alert className="alert-warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please review before proceeding.</AlertDescription>
              </Alert>

              <Alert className="alert-danger">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong.</AlertDescription>
              </Alert>

              <Alert className="alert-info">
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>Here's some helpful information.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>Content containers with various styles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle>Base Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Standard card style</p>
                  </CardContent>
                </Card>

                <Card className="card-interactive">
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Hover to see effect</p>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">With shadow</p>
                  </CardContent>
                </Card>

                <Card className="card-inset">
                  <CardHeader>
                    <CardTitle>Inset Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Recessed appearance</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress & Loading</CardTitle>
              <CardDescription>Loading states and progress indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Progress Bar</Label>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">{progress}%</p>
              </div>

              <div className="space-y-2">
                <Label>Skeleton States</Label>
                <div className="space-y-2">
                  <div className="skeleton-text" />
                  <div className="skeleton-title" />
                  <div className="flex gap-2">
                    <div className="skeleton-avatar" />
                    <div className="skeleton h-12 w-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Spinner</Label>
                <div className="spinner" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Tabular data display</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="table-row">
                    <TableCell>John Doe</TableCell>
                    <TableCell><Badge className="badge-success">Active</Badge></TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="table-row">
                    <TableCell>Jane Smith</TableCell>
                    <TableCell><Badge className="badge-warning">Pending</Badge></TableCell>
                    <TableCell>Faculty</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>User representation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Section */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Patterns</CardTitle>
              <CardDescription>Common navigation components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="nav-section">
                  <div className="nav-section-title">Section Title</div>
                  <div className="nav-item">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                  <div className="nav-item nav-item-active">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                  <div className="nav-item">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utility Patterns</CardTitle>
              <CardDescription>Reusable utility classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Glass Morphism</Label>
                <div className="glass p-4 rounded-lg">
                  <p>Glass effect background</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gradients</Label>
                <div className="flex gap-2">
                  <div className="gradient-primary text-white p-4 rounded">Primary</div>
                  <div className="gradient-accent text-white p-4 rounded">Accent</div>
                  <div className="gradient-success text-white p-4 rounded">Success</div>
                  <div className="gradient-danger text-white p-4 rounded">Danger</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Text Gradients</Label>
                <h3 className="text-2xl font-bold text-gradient gradient-primary">
                  Gradient Text Effect
                </h3>
              </div>

              <div className="space-y-2">
                <Label>Dividers</Label>
                <div className="space-y-4">
                  <Separator className="divider" />
                  <Separator className="divider-thick" />
                  <Separator className="divider-dashed" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout Patterns</CardTitle>
              <CardDescription>Common layout structures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Flex Patterns</Label>
                <div className="space-y-2">
                  <div className="flex-center p-4 border rounded">
                    <span>Centered Content</span>
                  </div>
                  <div className="flex-between p-4 border rounded">
                    <span>Left</span>
                    <span>Right</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Grid Responsive</Label>
                <div className="grid-responsive gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 border rounded text-center">
                      Item {i}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}