/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-02-04 13:21:20
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-10-31 17:06:21
 * @FilePath: \cps-blog-docusaurus-v3\src\pages\project\_components\ShowcaseCard\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import React, { memo } from "react";
import clsx from "clsx";
// import Image from "@theme/IdealImage";
import Link from "@docusaurus/Link";

import styles from "./styles.module.css";
import FavoriteIcon from "@site/src/components/svgIcons/FavoriteIcon";
import Tooltip from "../ShowcaseTooltip";
import { Tags, TagList, type TagType, type Project, type Tag } from "@site/src/pages/project/_components/data/project";
import { sortBy } from "@site/src/utils/jsUtils";

const TagComp = React.forwardRef<HTMLLIElement, Tag>(({ label, color, description }, ref) => (
  <li ref={ref} className={styles.tag} title={description}>
    <span className={styles.textLabel}>{label.toLowerCase()}</span>
    <span className={styles.colorLabel} style={{ backgroundColor: color }} />
  </li>
));

function ShowcaseCardTag({ tags }: { tags: TagType[] }) {
  const tagObjects = tags.map((tag) => ({ tag, ...Tags[tag] }));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) => TagList.indexOf(tagObject.tag));

  return (
    <>
      {tagObjectsSorted.map((tagObject, index) => {
        const id = `showcase_card_tag_${tagObject.tag}`;

        return (
          <Tooltip key={index} text={tagObject.description} anchorEl="#__docusaurus" id={id}>
            <TagComp key={index} {...tagObject} />
          </Tooltip>
        );
      })}
    </>
  );
}

const ShowcaseCard = memo(({ user }: { user: Project }) => (
  <li key={user.title} className={clsx("card shadow--md", styles.showcaseCard)}>
    <div className={clsx("card__image", styles.showcaseCardImage)}>
      <img src={user.preview ? user.preview : ""} alt={`${user.title}.preview`} />
    </div>
    <div className="card__body">
      <div className={clsx(styles.showcaseCardHeader)}>
        <h4 className={styles.showcaseCardTitle}>
          <Link href={user.website} className={styles.showcaseCardLink}>
            {user.title}
          </Link>
        </h4>
        {user.tags.includes("favorite") && <FavoriteIcon svgClass={styles.svgIconFavorite} size="small" />}
        {user.source && (
          <Link href={user.source} className={clsx("button button--secondary button--sm", styles.showcaseCardSrcBtn)}>
            源码
          </Link>
        )}
      </div>
      <p className={styles.showcaseCardBody}>{user.description}</p>
    </div>
    <ul className={clsx("card__footer", styles.cardFooter)}>
      <ShowcaseCardTag tags={user.tags} />
    </ul>
  </li>
));

export default ShowcaseCard;
