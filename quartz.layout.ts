import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      "Baseball Analytics": "https://github.com/doyled-it/obsidian-baseball",
      "Built with Quartz": "https://quartz.jzhao.xyz/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(
      Component.Explorer({
        title: "⚾ Baseball Analytics",
        folderClickBehavior: "collapse",
        folderDefaultState: "collapsed",
        useSavedState: true,
        mapFn: (node) => {
          // Custom ordering for baseball content
          if (node.name === "games") {
            node.displayName = "📅 Game Logs"
          }
          if (node.name === "seasons") {
            node.displayName = "🏆 Season Cards"
          }
          if (node.name === "templates") {
            return undefined // Hide templates folder
          }
          if (node.file?.slug?.includes("Baseball Card")) {
            node.displayName = `⚾ ${node.displayName}`
          }
          return node
        },
      }),
    ),
  ],
  right: [],
  afterBody: [],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(
      Component.Explorer({
        title: "⚾ Baseball Analytics",
        folderClickBehavior: "collapse",
        folderDefaultState: "collapsed",
        useSavedState: true,
      })
    ),
  ],
  right: [],
  afterBody: [],
}