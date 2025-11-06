/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import Layout from "@theme/Layout";
import clsx from "clsx";

// import CpsImgSwiper from "@site/src/components/ImageSwiper";
import FavoriteIcon from "@site/src/components/svgIcons/FavoriteIcon";

import ShowcaseCard from "./_components/ShowcaseCard";
import ShowcaseTooltip from "./_components/ShowcaseTooltip";
import ShowcaseTagSelect, { readSearchTags } from "./_components/ShowcaseTagSelect";
import { type Operator, readOperator } from "./_components/ShowcaseFilterToggle";
import { sortedProjects, Tags, TagList, type Project, type TagType } from "./_components/data/project";

import { useHistory, useLocation } from "@docusaurus/router";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import * as utils from "@site/src/utils";
import { DEFAULT_MAIN_COLOR, DEFAULT_SUB_COLOR } from "@site/src/store";

import styles from "./styles.module.css";

const TITLE = "🌟作品&项目💼";
const DESCRIPTION = "以下展示的项目均由本人独立开发，商业产品类型的项目均已取得甲方同意方才展示或开源。";
const GITHUB_URL = "https://github.com/muccppss";
const GITEE_URL = "https://gitee.com/capsion";

type ProjectState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

function restoreProjectState(projectState: ProjectState | null) {
  const { scrollTopPosition, focusedElementId } = projectState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };

  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

export function prepareUserState(): ProjectState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

const SearchNameQueryKey = "name";

function readSearchName(search: string) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function filterUsers(users: Project[], selectedTags: TagType[], operator: Operator, searchName: string | null) {
  if (searchName) {
    users = users.filter((user) => user.title.toLowerCase().includes(searchName.toLowerCase()));
  }
  if (selectedTags.length === 0) {
    return users;
  }
  return users.filter((user) => {
    if (user.tags.length === 0) {
      return false;
    }
    if (operator === "AND") {
      return selectedTags.every((tag) => user.tags.includes(tag));
    } else {
      return selectedTags.some((tag) => user.tags.includes(tag));
    }
  });
}

function useFilteredProjects() {
  const location = useLocation<ProjectState>();
  const [operator, setOperator] = useState<Operator>("OR");
  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [searchName, setSearchName] = useState<string | null>(null);
  // Sync tags from QS to state (delayed on purpose to avoid SSR/Client hydration mismatch)
  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setOperator(readOperator(location.search));
    setSearchName(readSearchName(location.search));
    restoreProjectState(location.state);
  }, [location]);

  return useMemo(() => filterUsers(sortedProjects, selectedTags, operator, searchName), [selectedTags, operator, searchName]);
}

function ShowcaseFilters() {
  const [inView, setInView] = useState(false);
  const ulRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true); // ul 完全进入视口时，触发动画
        } else {
          setInView(false); // ul 离开视口时，重置动画
        }
      },
      {
        threshold: 0.1, // 视口完全包含 ul 时触发
      }
    );

    if (ulRef.current) {
      observer.observe(ulRef.current);
    }

    return () => {
      if (ulRef.current) {
        observer.unobserve(ulRef.current);
      }
    };
  }, []);

  const styleList = TagList.map((tag, i) => {
    const { label, description, color } = Tags[tag];
    const id = `showcase_checkbox_id_${tag}`;
    const count = TagList.length;

    const animationDelay = `${50 * (count - i) + (Math.random() * 150 - Math.random() * 300)}ms`;

    const falldown = `falldown 0.6s cubic-bezier(.44, .02, .65, 1.3) ${animationDelay} forwards`;
    const riseup = `riseup 0.6s cubic-bezier(.44, .02, .65, 1.3) ${animationDelay} forwards`;
    const animation = inView ? falldown : riseup;

    const backgroundColor = utils.randomColor(0.5);
    const textColor = utils.invertColor(backgroundColor);

    return {
      liWarpStyle: {
        animation,
        opacity: inView ? 0 : 1,
        transition: inView ? "opacity 0.6s" : "",
        backgroundColor,
        display: "flex",
        borderRadius: "15px",
        // color: textColor,
        color: "white",
      },

      iconStyle: {
        backgroundColor: color,
        width: 10,
        height: 10,
        borderRadius: "50%",
        marginLeft: 8,
      },

      textStyle: {
        border: 0,
      },

      id,
      tag,
      label,
      description,
    };
  });

  return (
    <section className="container flex flex-col items-center justify-center margin-top--l margin-bottom--lg">
      <ul className={clsx("flex justify-center my-5 min-h-[100px]", styles.checkboxList)} ref={ulRef}>
        {styleList.map(({ tag, liWarpStyle, iconStyle, id, label, description }, i) => {
          return (
            <li key={i} className={styles.checkboxListItem} style={liWarpStyle}>
              <ShowcaseTooltip id={id} text={description} anchorEl="#__docusaurus">
                <ShowcaseTagSelect
                  tag={tag}
                  id={id}
                  label={label}
                  icon={tag === "favorite" ? <FavoriteIcon svgClass={styles.svgIconFavoriteXs} /> : <span style={iconStyle} />}
                />
              </ShowcaseTooltip>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// function SearchBar() {
//   const history = useHistory();
//   const location = useLocation();
//   const [value, setValue] = useState<string | null>(null);
//   useEffect(() => {
//     setValue(readSearchName(location.search));
//   }, [location]);
//   return (
//     <div className={styles.searchContainer}>
//       <input
//         id="searchbar"
//         placeholder="搜索项目"
//         value={value ?? undefined}
//         onInput={(e) => {
//           setValue(e.currentTarget.value);
//           const newSearch = new URLSearchParams(location.search);
//           newSearch.delete(SearchNameQueryKey);
//           if (e.currentTarget.value) {
//             newSearch.set(SearchNameQueryKey, e.currentTarget.value);
//           }
//           history.push({
//             ...location,
//             search: newSearch.toString(),
//             state: prepareUserState(),
//           });
//           setTimeout(() => {
//             document.getElementById("searchbar")?.focus();
//           }, 0);
//         }}
//       />
//     </div>
//   );
// }
interface ShowcaseCardsProps {
  title?: string;
}
function ShowcaseCards(props: ShowcaseCardsProps) {
  const filteredUsers = useFilteredProjects();

  if (filteredUsers.length === 0) {
    return (
      <section className="margin-top--lg margin-bottom--xl">
        <div className="container padding-vert--md text--center">
          <h2>No result</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="margin-top--lg margin-bottom--xl">
      {filteredUsers.length === sortedProjects.length ? (
        <>
          <div className="container margin-top--lg">
            <div className={clsx("margin-bottom--md", styles.showcaseFavoriteHeader)}>
              <h2>{props.title ? props.title : "所有项目"}</h2>
            </div>

            <ul className={styles.showcaseList}>
              {sortedProjects.map((user) => (
                <ShowcaseCard key={user.title} user={user} />
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="container">
          <div className={clsx("margin-bottom--md", styles.showcaseFavoriteHeader)}>
            <h2>{props.title ? props.title : "所有项目"}</h2>
          </div>
          <ul className={styles.showcaseList}>
            {filteredUsers.map((user) => (
              <ShowcaseCard key={user.title} user={user} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ProjectHeader({ title }: { title: string }) {
  const filteredUsers = useFilteredProjects();

  return (
    <section className="mb-5 text-center">
      <div className="mb-5">
        <h1 className="mb-0">{title}</h1>
        <span>{`(${filteredUsers.length} site${filteredUsers.length > 1 ? "s" : ""})`}</span>
      </div>
      <div>
        <strong>重要声明：</strong>
        {DESCRIPTION}
      </div>
      <div className="mt-2"></div>
      <div>
        <a className="mr-2 button button--primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
          前往 Github
        </a>
        <a className="button button--primary" href={GITEE_URL} target="_blank" rel="noreferrer">
          前往 Gitee
        </a>
      </div>
    </section>
  );
}

function Showcase(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <Head>
        {/* 修复css不加载的问题 */}
        <link rel="stylesheet" href={`${siteConfig.baseUrl}css/FallingItemsList.css`} />
      </Head>
      {/* <header className="flex justify-center" style={{ margin: "clamp(0.5rem, 2.5rem, 3vh) 0" }}> */}
      <header className={["flex justify-center", "sm:mt-2 md:mt-4 lg:mt-8 xl:mt-10"].join(" ")}>
        {/* <CpsImgSwiper
          mainColor={DEFAULT_MAIN_COLOR}
          subColor={DEFAULT_SUB_COLOR}
          autoSwitch={0}
          classNames={[
            "shadow-xl",
            "min-w-[400px] min-h-[300px]",
            "sm:w-[500px] sm:h-[300px]",
            "md:w-[650px] md:h-[450px]",
            "lg:w-[800px] lg:h-[600px]",
            "xl:w-[1050px] xl:h-[750px]",
          ].join(" ")}
        ></CpsImgSwiper> */}
      </header>
      <main className="margin-vert--lg">
        <ProjectHeader title={TITLE} />

        <ShowcaseFilters />

        <ShowcaseCards />
      </main>
    </Layout>
  );
}

export default Showcase;
