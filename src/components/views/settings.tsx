"use client";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label, Switch, Slider, Separator } from "@/components/ui/misc";
import { PageHeader } from "@/components/shared";
import { useBeacon } from "@/lib/store";
import { hazardLabel } from "@/lib/labels";
import type { Hazard } from "@/lib/types";

const countries = [
  { code: "BD", name: "Bangladesh (pilot)", admin: "Division › District › Upazila › Union", lang: "Bangla, English" },
  { code: "PH", name: "Philippines", admin: "Region › Province › Municipality › Barangay", lang: "Filipino, English" },
  { code: "MM", name: "Myanmar", admin: "State/Region › District › Township", lang: "Burmese, English" },
  { code: "IN", name: "India (coastal states)", admin: "State › District › Block", lang: "Hindi, Odia, Bengali, English" },
  { code: "VN", name: "Vietnam", admin: "Province › District › Commune", lang: "Vietnamese" },
  { code: "MZ", name: "Mozambique", admin: "Province › District › Posto", lang: "Portuguese" },
];

const depth: Record<Hazard, string> = {
  cyclone: "Full",
  flood: "Full",
  heatwave: "Plan & risk layer",
  landslide: "Preliminary susceptibility",
  coldwave: "Plan & alert layer",
  earthquake: "Post-event scenario",
};

export function SettingsView() {
  const { lang, setLang } = useBeacon();
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader title="Settings" subtitle="Country, hazards, language and human-oversight rules. Everything is configuration, not code." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Country</CardTitle>
            <CardDescription>Each country has its own admin levels, data sources, language pack and model calibration.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Select defaultValue="BD">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-1.5 text-xs">
              {countries.map((c) => (
                <div key={c.code} className="flex items-center justify-between rounded border px-2 py-1.5">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.admin}</span>
                  <Badge variant={c.code === "BD" ? "success" : "secondary"}>{c.code === "BD" ? "active" : "template"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hazards</CardTitle>
            <CardDescription>Six hazards; depth differs by data availability.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.keys(hazardLabel) as Hazard[]).map((h) => (
              <div key={h} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {hazardLabel[h].en} <span className="text-muted-foreground">· {hazardLabel[h].bn}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">{depth[h]}</div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Interface and outbound message language</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>English</Button>
              <Button variant={lang === "bn" ? "default" : "outline"} onClick={() => setLang("bn")}>বাংলা</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Send field tasks in Bangla first</Label>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Human oversight</CardTitle>
            <CardDescription>These gates cannot be turned off in the pilot.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              "Approve every outbound WhatsApp / SMS",
              "Confirm every figure before press release",
              "Approve plan changes triggered by evidence",
            ].map((r) => (
              <div key={r} className="flex items-center justify-between">
                <Label>{r}</Label>
                <Switch checked disabled />
              </div>
            ))}
            <Separator />
            <div className="flex flex-col gap-2">
              <Label>Minimum AI confidence to auto-mark a report &ldquo;verified pending review&rdquo;</Label>
              <Slider defaultValue={[80]} max={100} step={5} />
              <div className="text-muted-foreground text-xs">Below this, reports stay &ldquo;unsure&rdquo; for a person to check.</div>
            </div>
            <Button className="self-start" onClick={() => toast.success("Settings saved (demo)")}>
              Save
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
