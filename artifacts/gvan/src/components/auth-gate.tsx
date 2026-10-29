import { useState, type CSSProperties, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Crown, Eye, EyeOff, Heart, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import romanceImage from "@assets/generated_images/gvan-auth-romance.jpg";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type DemoProfile = { fullName: string; email: string };
const emailRule = z.string().trim().email("Enter a valid email address.");
const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Enter your password."),
});
const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: emailRule,
  password: z.string().min(8, "Use at least 8 characters."),
  confirmPassword: z.string().min(1, "Confirm your password."),
}).superRefine((values, context) => {
  if (values.password !== values.confirmPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match.", path: ["confirmPassword"] });
  }
});

type AuthProps = { onAuthenticated: (profile: DemoProfile) => void };

function AuthBackdrop({ children, register = false }: { children: ReactNode; register?: boolean }) {
  return <div className={`auth-page ${register ? "auth-page-register" : ""}`} style={{ "--auth-photo": `url("${romanceImage}")` } as CSSProperties}>
    <div className="auth-photo" aria-hidden="true" />
    <div className="auth-vignette" aria-hidden="true" />
    <main className="auth-layout">
      <div className="auth-visual-copy" aria-hidden="true">
        {!register && <div className="auth-wordmark-lockup">
          <Crown className="auth-wordmark-crown" size={22} strokeWidth={1.8} />
          <div className="auth-wordmark-hearts"><Heart size={20} /><Heart size={17} /></div>
          <div className="auth-wordmark">GVAN</div>
          <p className="auth-tagline"><span>Explore</span><i /><span>Connect</span><i /><span>Enjoy</span></p>
        </div>}
      </div>
      {children}
      <p className="auth-footer">A thoughtful space, made for you.</p>
    </main>
  </div>;
}

function PasswordInput({ field, testId, placeholder = "Password" }: { field: any; testId: string; placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="auth-input-wrap">
    <LockKeyhole className="auth-input-icon" size={19} aria-hidden="true" />
    <Input {...field} id={testId} type={visible ? "text" : "password"} placeholder={placeholder} autoComplete={testId.includes("confirm") ? "new-password" : "current-password"} className="auth-input auth-password-input" data-testid={testId} />
    <button type="button" className="auth-eye-button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} data-testid={`${testId}-toggle`}>
      {visible ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  </div>;
}

export function Login({ onAuthenticated }: AuthProps) {
  const [, setLocation] = useLocation();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const submit = (values: z.infer<typeof loginSchema>) => {
    const savedName = localStorage.getItem("gvan-demo-profile");
    let fullName = values.email.split("@")[0].replace(/[._-]+/g, " ").trim();
    try {
      const parsed = savedName ? JSON.parse(savedName) as DemoProfile : null;
      if (parsed?.email === values.email.trim()) fullName = parsed.fullName;
    } catch { /* A malformed local demo profile is ignored. */ }
    onAuthenticated({ fullName: fullName || "Friend", email: values.email.trim() });
    setLocation("/");
  };

  return <AuthBackdrop>
    <section className="auth-card auth-card-login" aria-labelledby="auth-title" data-testid="panel-login">
      <div className="auth-switch" aria-label="Account access">
        <span className="auth-switch-active" aria-current="page">Login</span>
        <Link href="/register" data-testid="link-login-register">Register</Link>
      </div>
      <h1 id="auth-title" className="sr-only">Log in to Gvan</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="auth-form" noValidate data-testid="form-login">
          <FormField control={form.control} name="email" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Email address</FormLabel>
            <FormControl><div className="auth-input-wrap"><Mail className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="login-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="auth-input" data-testid="input-login-email" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-login-email" />
          </FormItem>} />
          <FormField control={form.control} name="password" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Password</FormLabel>
            <FormControl><PasswordInput field={field} testId="input-login-password" /></FormControl>
            <FormMessage className="auth-error" data-testid="error-login-password" />
          </FormItem>} />
          <p className="auth-demo-note" role="note" data-testid="notice-demo-auth">Demo only; not secure authentication. Your password is never saved or sent.</p>
          <Button type="submit" className="auth-submit" data-testid="button-login-submit" disabled={form.formState.isSubmitting}>
            Login <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </Form>
    </section>
  </AuthBackdrop>;
}

export function Register({ onAuthenticated }: AuthProps) {
  const [, setLocation] = useLocation();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });
  const submit = (values: z.infer<typeof registerSchema>) => {
    const profile = { fullName: values.fullName.trim(), email: values.email.trim() };
    localStorage.setItem("gvan-demo-profile", JSON.stringify(profile));
    onAuthenticated(profile);
    setLocation("/");
  };

  return <AuthBackdrop register>
    <section className="auth-card auth-card-register" aria-labelledby="auth-title" data-testid="panel-register">
      <div className="auth-card-heart auth-card-hearts" aria-hidden="true"><Heart size={29} strokeWidth={1.5} /><Heart size={25} strokeWidth={1.5} /></div>
      <p className="auth-card-eyebrow">Your space starts here</p>
      <h2 id="auth-title">Create Account</h2>
      <p className="auth-card-subtitle">A few details, then you’re in.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="auth-form auth-register-form" noValidate data-testid="form-register">
          <FormField control={form.control} name="fullName" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Full name</FormLabel>
            <FormControl><div className="auth-input-wrap"><UserRound className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="register-name" autoComplete="name" placeholder="Your name" className="auth-input" data-testid="input-register-name" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-name" />
          </FormItem>} />
          <FormField control={form.control} name="email" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Email address</FormLabel>
            <FormControl><div className="auth-input-wrap"><Mail className="auth-input-icon" size={19} aria-hidden="true" /><Input {...field} id="register-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="auth-input" data-testid="input-register-email" /></div></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-email" />
          </FormItem>} />
          <FormField control={form.control} name="password" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Password</FormLabel>
            <FormControl><PasswordInput field={field} testId="input-register-password" /></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-password" />
          </FormItem>} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => <FormItem className="auth-field">
            <FormLabel>Confirm password</FormLabel>
            <FormControl><PasswordInput field={field} testId="input-register-confirm-password" placeholder="Re-enter your password" /></FormControl>
            <FormMessage className="auth-error" data-testid="error-register-confirm-password" />
          </FormItem>} />
          <p className="auth-demo-note" role="note" data-testid="notice-demo-register">Demo only — not secure authentication. Only your name and email are kept in this browser; your password is never saved or sent.</p>
          <Button type="submit" className="auth-submit" data-testid="button-register-submit" disabled={form.formState.isSubmitting}>
            Create my space <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </Form>
      <p className="auth-bottom-prompt">Already have a space? <Link href="/login" data-testid="link-register-to-login">Log in</Link></p>
    </section>
  </AuthBackdrop>;
}
