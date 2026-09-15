import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** A human introduction to this application, outside the governed record. */
export default function AboutPage() {
  return (
    <main className="min-w-0 flex-1 overflow-x-clip bg-fd-background px-4 py-10 sm:px-6 sm:py-16">
      <article className="mx-auto w-full max-w-5xl">
        <Card className="overflow-hidden border-fd-border bg-fd-card shadow-md">
          <div className="grid min-w-0 gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center md:gap-10">
            <div className="mx-auto w-full max-w-[17rem]">
              <div className="rounded-xl border border-fd-border bg-fd-muted p-3">
                <Image
                  src="/images/azm2361.png"
                  alt="Azmat Ali"
                  width={720}
                  height={792}
                  priority
                  sizes="(min-width: 768px) 17rem, calc(100vw - 4rem)"
                  className="h-auto w-full rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="min-w-0">
              <CardHeader className="gap-3 px-0">
                <p className="font-mono text-xs tracking-[0.18em] text-fd-muted-foreground uppercase">
                  System of record
                </p>
                <CardTitle className="font-display text-3xl leading-tight tracking-[-0.02em] text-balance sm:text-4xl">
                  About This KSoR Handbook
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-pretty sm:text-lg">
                  AI Assisted Knowledge System of Record
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-0 pt-7 text-[0.9375rem] leading-7 text-fd-muted-foreground sm:text-base">
                <p>
                  <span className="font-medium text-fd-foreground">App Built By:</span> Azmat Ali
                </p>
                <p className="text-pretty">
                  This project demonstrates governed knowledge, human approval, and AI-assisted
                  development using Codex and KSoR.
                </p>
              </CardContent>

              <CardFooter className="mt-8 border-t border-fd-border px-0 pt-5 flex flex-col gap-2">
  <p className="font-mono text-xs tracking-[0.12em] text-fd-muted-foreground uppercase">
    Built with Codex and KSoR
  </p>
  <p className="font-mono text-xs tracking-[0.12em] text-fd-muted-foreground uppercase">
    Author : Sir.Zia, Sir.Junaid, Maa'm. Wania
  </p>
</CardFooter>
            </div>
          </div>
        </Card>
      </article>
    </main>
  );
}
