import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Mail, Linkedin, Mic, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  usePageSEO({
    title: "Contact — Who Do I Work For",
    description: "Get in touch — media inquiries, speaking, advisory, company partnerships, or general questions.",
    path: "/contact",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const message = (formData.get("message") as string || "").trim();
    const reason = (formData.get("reason") as string) || "General";

    if (!name || !email || !message) {
      setError("Please fill out all required fields.");
      return;
    }

    setError("");
    const subject = `Who Do I Work For Contact: ${reason}`;

    setSubmitting(true);
    const { error: insertError } = await supabase.from("contact_submissions").insert({
      name,
      email,
      subject,
      message,
    });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message || "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    form.reset();
  };

  const busy = submitting;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <section className="max-w-[1100px] mx-auto px-6 lg:px-16 pt-20 pb-12">
          <p className="font-mono text-xs tracking-[0.15em] uppercase text-primary mb-4">
            Get In Touch
          </p>
          <h1
            className="font-sans text-foreground leading-[1.1] mb-6"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 800, letterSpacing: "-1px" }}
          >
            Let's talk.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[52ch]">
            Whether it's media, speaking, a company partnership, or a question — we're here.
          </p>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 lg:px-16 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-sans text-lg font-bold text-foreground mb-3">Reach out directly.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                We read everything. Response times depend on volume, but if it's relevant to the Who Do I Work For mission, we'll get back to you.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-5 h-5 shrink-0" aria-hidden />
                  <span>jackye@jackyeclayton.com</span>
                </div>
                <a href="https://www.linkedin.com/in/jackyeclayton/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5 shrink-0" />
                  LinkedIn
                </a>
                <a href="https://jackyeclayton.com/speaking" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mic className="w-5 h-5 shrink-0" />
                  Speaking Inquiries
                </a>
              </div>
            </div>

            {submitted ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-sans text-lg font-bold text-foreground mb-2">Thanks — we got your message.</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll reply at the email you provided when we can. You can also reach us at{" "}
                  <span className="text-foreground font-medium">jackye@jackyeclayton.com</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground block">Name</label>
                  <input type="text" id="name" name="name" required placeholder="Your name" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground block">Email</label>
                  <input type="email" id="email" name="email" required placeholder="your@email.com" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium text-foreground block">Reason for reaching out</label>
                  <select id="reason" name="reason" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "40px" }}>
                    <option value="General">General</option>
                    <option value="Media/Press">Media / Press</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Advisory/Consulting">Advisory / Consulting</option>
                    <option value="Company Partnership">Company Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground block">Message</label>
                  <textarea id="message" name="message" required placeholder="What's on your mind?" rows={5} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-vertical" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
