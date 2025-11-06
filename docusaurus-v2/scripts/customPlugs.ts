export interface Opts {
  tagName: "scripts" | "link";
  attributes: { charset: string; src?: string; href?: string };
}

export async function addHeaderTag(context: any, opts: any) {
  return {
    name: "cps-plugins",
    injectHtmlTags({ content }: any) {
      return {
        headTags: [
          {
            tagName: "script",
            attributes: { charset: "utf-8", src: "/scripts/beforeWindowLoad.js" },
          },
        ],
        // proBodyTags: [
        //   {
        //     tagName: "script",
        //     attributes: { charset: "utf-8", src: "/cps.js" },
        //   },
        // ],
      };
    },
  };
}
