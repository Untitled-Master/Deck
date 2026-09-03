import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import { Github, Heart, Target, Sparkles, Code2, Palette, Database, Braces, Box, Layers, ExternalLink, Mail, Star, BookOpen, Zap } from "lucide-react"
import DeckLogo from "@/components/DeckLogo"
import { APP_VERSION } from "@/lib/version"
import { useTranslation } from "@/context/I18nContext"

export default function InfoPage() {
  const { t } = useTranslation()
  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 bg-[#1D1C1A] overflow-auto">
          <div className="max-w-[960px] mx-auto p-6 md:p-7">
            {/* Hero */}
            <div className="border border-[#3B3A36] rounded-[12px] overflow-hidden bg-[#292824]">
              <div className="bg-gradient-to-br from-[#1D1C1A] via-[#292824] to-[#1D1C1A] px-6 md:px-8 py-8 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-[12px] bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center shrink-0">
                  <DeckLogo className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-[28px] font-semibold text-[#F0EFEC] tracking-tight leading-none flex items-center gap-3">
                    Deck
                    <span className="text-[11px] font-mono font-medium px-2 py-1 rounded-full bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0]">v{APP_VERSION}</span>
                    <span className="hidden sm:inline-flex text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.12)] border border-[#16803A]/40 text-[#22C55E]">{t("info.badgePostgres")}</span>
                  </h1>
                  <p className="text-[14px] text-[#B7B5B0] mt-2.5 leading-relaxed max-w-[560px]">
                    {t("info.subtitle")}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a href="https://github.com/Untitled-Master/Deck" target="_blank" rel="noreferrer" className="h-9 px-4 bg-[#F0EFEC] hover:bg-white text-[#1D1C1A] rounded-[7px] text-[13px] font-semibold flex items-center gap-2">
                      <Github className="w-4 h-4" /> {t("info.githubButton")} <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                    <a href="https://github.com/Untitled-Master/Deck" target="_blank" rel="noreferrer" className="h-9 px-3.5 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#292824] hover:text-[#F0EFEC] flex items-center gap-1.5">
                      <Star className="w-4 h-4" /> {t("info.star")}
                    </a>
                  </div>
                </div>
              </div>
              <div className="px-6 md:px-8 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex flex-wrap items-center gap-3 text-[11px] text-[#85837E]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> {t("info.localFirst")}</span>
                <span className="hidden md:inline w-1 h-1 rounded-full bg-[#3B3A36]" />
                <span>{t("info.stackLine")}</span>
                <span className="ml-auto font-mono text-[#66645F]">{t("info.crafted")}</span>
              </div>
            </div>

            {/* Vision */}
            <div className="mt-6 border border-[#3B3A36] rounded-[10px] bg-[#292824] overflow-visible">
              <div className="px-5 py-4 flex items-start gap-3 border-b border-[#3B3A36] bg-[#292824] rounded-t-[10px]">
                <div className="w-9 h-9 rounded-[8px] bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-[#B7B5B0]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#F0EFEC] leading-none">{t("info.vision.title")}</h3>
                  <p className="text-[12.5px] text-[#85837E] mt-1.5 leading-relaxed max-w-[640px]">{t("info.vision.subtitle")}</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[13px] leading-relaxed text-[#D6D4CF]">
                  {t("info.vision.desc").split(t("info.vision.speed")).length > 1 ? (
                    <>
                      {t("info.vision.desc").split(t("info.vision.speed"))[0]}<span className="text-[#F0EFEC] font-medium">{t("info.vision.speed")}</span>{t("info.vision.desc").split(t("info.vision.speed"))[1].split(t("info.vision.clarity"))[0]}<span className="text-[#F0EFEC] font-medium">{t("info.vision.clarity")}</span>{t("info.vision.desc").split(t("info.vision.clarity"))[1].split(t("info.vision.localFirst"))[0]}<span className="text-[#F0EFEC] font-medium">{t("info.vision.localFirst")}</span>{t("info.vision.desc").split(t("info.vision.localFirst"))[1]}
                    </>
                  ) : t("info.vision.desc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: Zap, title: t("info.vision.fastTitle"), desc: t("info.vision.fastDesc") },
                    { icon: Sparkles, title: t("info.vision.beautifulTitle"), desc: t("info.vision.beautifulDesc") },
                    { icon: Layers, title: t("info.vision.localCardTitle"), desc: t("info.vision.localCardDesc") },
                  ].map(card => (
                    <div key={card.title} className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3.5">
                      <card.icon className="w-4 h-4 text-[#B7B5B0]" />
                      <div className="text-[13px] font-medium text-[#F0EFEC] mt-2">{card.title}</div>
                      <div className="text-[12px] text-[#85837E] mt-1 leading-relaxed">{card.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 text-[12px] text-[#85837E] bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] px-3 py-2.5">
                  <BookOpen className="w-4 h-4 text-[#B7B5B0] shrink-0 mt-0.5" />
                  <span>{t("info.vision.visionLineLabel")} <span className="text-[#F0EFEC] font-medium">{t("info.vision.visionLineValue")}</span>{t("info.vision.visionLineRest")}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 border border-[#3B3A36] rounded-[10px] bg-[#292824] overflow-visible">
              <div className="px-5 py-4 flex items-start gap-3 border-b border-[#3B3A36] bg-[#292824] rounded-t-[10px]">
                <div className="w-9 h-9 rounded-[8px] bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#EAB308]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#F0EFEC] leading-none">{t("info.features.title")}</h3>
                  <p className="text-[12.5px] text-[#85837E] mt-1.5">{t("info.features.subtitle")}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: Braces, title: t("info.features.sqlTitle"), desc: t("info.features.sqlDesc") },
                    { icon: Box, title: t("info.features.schemaTitle"), desc: t("info.features.schemaDesc") },
                    { icon: Database, title: t("info.features.dataTitle"), desc: t("info.features.dataDesc") },
                    { icon: Code2, title: t("info.features.apiTitle"), desc: t("info.features.apiDesc") },
                    { icon: Palette, title: t("info.features.themesTitle"), desc: t("info.features.themesDesc") },
                    { icon: Layers, title: t("info.features.healthTitle"), desc: t("info.features.healthDesc") },
                  ].map(item => (
                    <div key={item.title} className="flex gap-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3.5">
                      <div className="w-8 h-8 rounded-[6px] bg-[#292824] border border-[#3B3A36] flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-[#B7B5B0]" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#F0EFEC]">{item.title}</div>
                        <div className="text-[12px] text-[#85837E] mt-1 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Who made it + GitHub */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#3B3A36] rounded-[10px] bg-[#292824] overflow-visible">
                <div className="px-5 py-4 flex items-center gap-3 border-b border-[#3B3A36] bg-[#292824] rounded-t-[10px]">
                  <img src="https://avatars.githubusercontent.com/u/128633214?s=400&u=84e3532bbac85ae87daa6979bcb079c3ba53348a&v=4" alt={t("info.creator.name")} className="w-9 h-9 rounded-full bg-[#1D1C1A] border border-[#3B3A36] object-cover shrink-0" />
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#F0EFEC] leading-none">{t("info.creator.title")}</h3>
                    <p className="text-[12px] text-[#85837E] mt-1">{t("info.creator.subtitle")}</p>
                  </div>
                  <span className="ml-auto text-[10px] tracking-widest font-medium px-2 py-1 rounded-full bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">{t("info.creator.badge")}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-[15px] font-semibold text-[#F0EFEC]">{t("info.creator.name")}</div>
                    <div className="text-[12px] text-[#B7B5B0]">{t("info.creator.role")}</div>
                    <div className="text-[12px] text-[#85837E] mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {t("info.creator.untitled")}</div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#B7B5B0] bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3">
                    {t("info.creator.quote")}
                  </p>
                  <div className="flex items-center gap-2 text-[12px] text-[#85837E]">
                    <Heart className="w-3.5 h-3.5 text-[#EF4444]" /> {t("info.creator.built")}
                  </div>
                </div>
              </div>

              <div className="border border-[#3B3A36] rounded-[10px] bg-[#292824] overflow-visible">
                <div className="px-5 py-4 flex items-center gap-3 border-b border-[#3B3A36] bg-[#292824] rounded-t-[10px]">
                  <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#F0EFEC] leading-none">{t("info.github.title")}</h3>
                    <p className="text-[12px] text-[#85837E] mt-1">{t("info.github.subtitle")}</p>
                  </div>
                  <span className="ml-auto hidden sm:inline-flex text-[10px] font-bold px-1.5 py-1 rounded bg-white text-black border border-[#E7E5E4]">{t("info.github.public")}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3">
                    <div className="text-[11px] tracking-widest text-[#85837E] font-mono">{t("info.github.githubCom")}</div>
                    <div className="text-[13px] font-mono font-medium text-[#F0EFEC] mt-1 break-all">{t("info.github.repoPath")}</div>
                    <div className="text-[12px] text-[#85837E] mt-1">{t("info.github.starHint")}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href="https://github.com/Untitled-Master/Deck" target="_blank" rel="noreferrer" className="h-9 px-4 bg-[#F0EFEC] hover:bg-white text-[#1D1C1A] rounded-[7px] text-[13px] font-semibold flex items-center gap-2">
                      <Github className="w-4 h-4" /> {t("info.github.openRepo")} <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                    <a href="https://github.com/Untitled-Master/Deck/issues" target="_blank" rel="noreferrer" className="h-9 px-3.5 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#292824] hover:text-[#F0EFEC] flex items-center gap-1.5">
                      {t("info.github.reportIssue")}
                    </a>
                  </div>
                  <div className="text-[11px] text-[#66645F] flex items-center gap-1.5"><Star className="w-3 h-3" /> {t("info.github.starCta")}</div>
                </div>
              </div>
            </div>

            {/* Stack / Credits */}
            <div className="mt-6 border border-[#3B3A36]/60 rounded-[9px] bg-[#1D1C1A]/50 px-4 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="text-[12px] leading-relaxed text-[#85837E]">
                  <span className="font-medium text-[#B7B5B0]">{t("info.stack.label")}</span> React 19 • Vite 6 • Tailwind • shadcn/new-york • Monaco • Express 5 • pg 8 • Sonner
                  <span className="mx-2 text-[#3B3A36]">•</span>
                  <span className="font-mono text-[#66645F]">{t("info.stack.deckVersion").replace("{version}", APP_VERSION)}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <a href="https://github.com/Untitled-Master/Deck" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-[#292824] border border-[#3B3A36] text-[#B7B5B0] hover:text-[#F0EFEC] hover:bg-[#3B3935]">{t("info.stack.docs")}</a>
                  <a href="https://github.com/Untitled-Master/Deck/blob/main/README.md" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-[#292824] border border-[#3B3A36] text-[#B7B5B0] hover:text-[#F0EFEC] hover:bg-[#3B3935]">{t("info.stack.changelog")}</a>
                  <span className="text-[#66645F] hidden md:inline">{t("info.crafted")}</span>
                </div>
              </div>
            </div>

            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
