# Portfolio Arena

A personal resume website presented as a small isometric arena game. The visitor steers a Hero around a map and discovers the owner's resume by capturing Towers.

## Language

### Resume content

**Resume Data**:
The single source file holding all resume content; every in-world thing that shows resume content is generated from it.
_Avoid_: config, content file, JSON

**Resume Entry**:
One degree, job, or project in the Resume Data. Shown by exactly one Tower. Its content is a short description plus a list of Highlights.
_Avoid_: item, card, record

**Entry Kind**:
What a Resume Entry is: experience, project or education. Independent of the Lane that holds it; the Plain Resume groups by Entry Kind (Experience, then Projects, then Education), so it reads like a standard resume.
_Avoid_: type, category

**Highlight**:
One bullet-point achievement inside a Resume Entry, ideally with a measurable result.
_Avoid_: bullet, point, detail

**Skill**:
One of four headline competencies with a proficiency level from 1 to 5. Shown by exactly one Ability.
_Avoid_: tech, tool

**Inventory**:
The owner's full set of Tools, grouped by area (e.g. Frontend, Backend & Data, DevOps & Tooling). Opened from a button beside the Ability bar; also listed in the Plain Resume.
_Avoid_: tech stack, toolbox, skills list

**Tool**:
One technology in the Inventory, with no proficiency level. A Skill can share its name with a Tool; the Skill is the headline, the Tool is the catalogue entry.
_Avoid_: skill, item

**Contact Link**:
One way to reach or learn about the owner (GitHub, LinkedIn, email, resume PDF). Shown as a Shop Item.
_Avoid_: social, link

### The world

**Hero**:
The single character the visitor controls.
_Avoid_: player, avatar, character

**Base**:
The starting area where the Hero spawns and the Shop stands.
_Avoid_: spawn, fountain

**Lane**:
A path from the Base to the Nexus that groups related Towers under one label (Beginnings, Projects, Experience). A Lane may mix Entry Kinds. Holds 1–4 Towers.
_Avoid_: road, track, section

**Tower**:
An in-world structure that represents exactly one Resume Entry.
_Avoid_: building, node, checkpoint

**Nexus**:
The central structure at the meeting point of the Lanes; the final objective.
_Avoid_: ancient, throne, core, goal

**Shop**:
The structure near the Base that lists Shop Items.
_Avoid_: store, contact page

**Shop Item**:
A Contact Link presented as something the Shop sells.
_Avoid_: product

**Ability**:
A keyed action (Q/W/E/R) that plays an effect and reveals one Skill.
_Avoid_: spell, power, skill (the Skill is the content; the Ability is the in-game action)

### Progress

**Capture**:
The first time the Hero enters a Tower's range. Grants XP once; later entries only reopen the Info Panel.
_Avoid_: unlock, visit, conquer

**XP / Level**:
Progress earned only by Captures; Level is derived from XP.
_Avoid_: score, points

**Fog**:
Darkness covering unexplored ground; ground the Hero has been near stays revealed for the rest of the Run.
_Avoid_: shroud, mask

**Run**:
One page visit. All Captures, XP and revealed Fog reset on reload.
_Avoid_: session, save, game

**Victory**:
Reached when the Hero arrives at the Nexus with at least 3 Captures. Before that, arriving shows how many Captures remain. After Victory the Run continues.
_Avoid_: win, game over, end

### Views

**Info Panel**:
The side panel showing one Resume Entry's full content.
_Avoid_: modal, popup, card

**Plain Resume**:
The scrollable, non-game HTML view of the whole Resume Data, with Resume Entries grouped by Entry Kind. Works without WebGL and is the fallback when the game cannot run.
_Avoid_: skip view, text mode, fallback page
