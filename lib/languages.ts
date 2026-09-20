export const SUPPORTED_LANGUAGES = [
  { code:"en-US", name:"English", speechCode:"en-US" },
  { code:"ml-IN", name:"Malayalam", speechCode:"ml-IN" },
  { code:"hi-IN", name:"Hindi", speechCode:"hi-IN" },
  { code:"ta-IN", name:"Tamil", speechCode:"ta-IN" },
  { code:"te-IN", name:"Telugu", speechCode:"te-IN" },
  { code:"kn-IN", name:"Kannada", speechCode:"kn-IN" },
  { code:"bn-IN", name:"Bengali", speechCode:"bn-IN" },
  { code:"mr-IN", name:"Marathi", speechCode:"mr-IN" },
  { code:"gu-IN", name:"Gujarati", speechCode:"gu-IN" },
  { code:"pa-IN", name:"Punjabi", speechCode:"pa-IN" },
  { code:"ur-IN", name:"Urdu", speechCode:"ur-IN" },
  { code:"fr-FR", name:"French", speechCode:"fr-FR" },
  { code:"de-DE", name:"German", speechCode:"de-DE" },
  { code:"es-ES", name:"Spanish", speechCode:"es-ES" },
  { code:"ja-JP", name:"Japanese", speechCode:"ja-JP" },
  { code:"ko-KR", name:"Korean", speechCode:"ko-KR" },
  { code:"ar-SA", name:"Arabic", speechCode:"ar-SA" },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]["code"];

export function getLanguage(code:string) {
  return SUPPORTED_LANGUAGES.find(x=>x.code===code) || SUPPORTED_LANGUAGES[0];
}
