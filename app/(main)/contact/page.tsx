import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, HelpCircle } from "lucide-react"
import type { Metadata } from "next"
import { AnimatedBackground } from "@/components/animated-background"

export const metadata: Metadata = {
  title: "Contact Us | NIBOG - New India Baby Olympic Games",
  description: "Get in touch with the NIBOG team for inquiries about events, registrations, partnerships, or any other questions.",
}

export default function ContactPage() {
  return (
    <AnimatedBackground variant="contact">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white py-16 dark:from-purple-950/20 dark:to-background md:py-24">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              We'd love to hear from you! Reach out to the NIBOG team with any questions or inquiries.
            </p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-[-135px] z-0 [opacity-0.1]">
          <Image
            src="/images/contact/pattern-bg.jpg"
            alt="Background pattern"
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Get in Touch</h2>
                <p className="mt-2 text-muted-foreground">
                  Have questions about our events, registration process, or anything else? Our team is here to help!
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+91 98765 43210</p>
                    <p className="text-muted-foreground">+91 87654 32109</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">info@nibog.in</p>
                    <p className="text-muted-foreground">support@nibog.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Head Office</h3>
                    <p className="text-muted-foreground">
                      123 Jubilee Hills, Road No. 5<br />
                      Hyderabad, Telangana 500033<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Office Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src="/images/contact/office-image.jpg"
                  alt="NIBOG Office"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <Card>
                <CardContent className="pt-6">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="Enter your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter your email address" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter your phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="What is your message about?" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your inquiry"
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/30 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              FAQs
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">
              Find answers to common questions about NIBOG events and registration
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                question: "How do I register my child for a NIBOG event?",
                answer: "You can register your child through our website by visiting the Events page, selecting an event in your city, and following the registration process. You'll need to provide your child's details and make the registration payment online.",
              },
              {
                question: "What age groups can participate in NIBOG events?",
                answer: "NIBOG events are designed for children aged 5 months to 12 years. Different events have specific age categories, and children can only participate in events appropriate for their age group.",
              },
              {
                question: "How are winners determined in the competitions?",
                answer: "Winners are determined based on the specific rules of each event. For races, the fastest time wins. For other events, judges evaluate based on predetermined criteria appropriate for the age group and activity.",
              },
              {
                question: "What should my child wear to the event?",
                answer: "Children should wear comfortable clothing that allows for easy movement. Sports attire is recommended. For crawling events, knee pads are optional but recommended.",
              },
              {
                question: "Can parents accompany their children during the events?",
                answer: "Yes, parents can accompany very young children (especially in the baby crawling and baby walker categories). For older children, parents will be seated in the designated viewing area.",
              },
              {
                question: "What happens if my child doesn't want to participate on the day?",
                answer: "We understand that young children may sometimes feel uncomfortable in new environments. Our staff will try to make your child comfortable, but we never force participation. Unfortunately, registration fees are non-refundable in such cases.",
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{faq.question}</h3>
                      <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Don't see your question here? Contact us directly and we'll be happy to help!
            </p>
          </div>
        </div>
      </section>

      {/* City Offices */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Our Presence
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">NIBOG City Offices</h2>
            <p className="mt-4 text-muted-foreground">
              Find us in 21 cities across India
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              {
                city: "Hyderabad",
                address: "123 Jubilee Hills, Road No. 5",
                image: "/images/contact/hyderabad.jpg",
              },
              {
                city: "Bangalore",
                address: "456 Indiranagar, 12th Main",
                image: "/images/contact/bangalore.jpg",
              },
              {
                city: "Mumbai",
                address: "789 Bandra West, Linking Road",
                image: "/images/contact/mumbai.jpg",
              },
              {
                city: "Delhi",
                address: "101 Connaught Place, Block A",
                image: "/images/contact/delhi.jpg",
              },
              {
                city: "Chennai",
                address: "202 T. Nagar, Venkatanarayana Road",
                image: "/images/contact/chennai.jpg",
              },
              {
                city: "Kolkata",
                address: "303 Park Street, Near Park Hotel",
                image: "/images/contact/kolkata.jpg",
              },
              {
                city: "Pune",
                address: "404 Koregaon Park, Lane 7",
                image: "/images/contact/pune.jpg",
              },
              {
                city: "Ahmedabad",
                address: "505 Navrangpura, CG Road",
                image: "/images/contact/ahmedabad.jpg",
              },
            ].map((office, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={office.image}
                    alt={`${office.city} Office`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold">{office.city}</h3>
                  <p className="text-sm text-muted-foreground">{office.address}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/locations">View All Locations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-600 py-16 text-white dark:bg-purple-900 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Ready to Join the NIBOG Family?
            </h2>
            <p className="mt-4 text-xl text-purple-100">
              Register your child for our upcoming events and be part of India's biggest baby Olympic games
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50" asChild>
                <Link href="/register-event">Register Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10" asChild>
                <Link href="/register">Register Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  )
}
