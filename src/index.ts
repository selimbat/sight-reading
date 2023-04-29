import { Renderer, TickContext, Stave, StaveNote, Accidental } from "vexflow";
import './main.scss'

const addNoteBtn = document.createElement("button");
addNoteBtn.innerText = 'Add note'
document.body.appendChild(addNoteBtn);
const output = document.createElement("div");
document.body.appendChild(output);

const renderer = new Renderer(output, Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 300);
const context = renderer.getContext();

const tickContext = new TickContext();

// Create a stave of width 10000 at position 10, 40 on the canvas.
const stave = new Stave(10, 10, 10000).addClef("bass");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();


const durations = ["8", "4", "2", "1"];

const notes = [
    ["c", "#", "4"],
    ["e", "b", "5"],
    ["g", "", "5"],
    ["d", "b", "4"],
    ["b", "bb", "3"],
    ["a", "b", "4"],
    ["f", "b", "5"],
].map(([letter, accidental, octave]) => {
    const note = new StaveNote({
        clef: "treble",
        keys: [`${letter}${accidental}/${octave}`],
        duration: durations[Math.floor(Math.random() * durations.length)],
    });
    note.setContext(context).setStave(stave);

    // If a StaveNote has an accidental, we must render it manually.
    // This is so that you get full control over whether to render
    // an accidental depending on the musical context. Here, if we
    // have one, we want to render it. (Theoretically, we might
    // add logic to render a natural sign if we had the same letter
    // name previously with an accidental. Or, perhaps every twelfth
    // note or so we might render a natural sign randomly, just to be
    // sure our user who's learning to read accidentals learns
    // what the natural symbol means.)
    if (accidental) {
        note.addModifier(new Accidental(accidental));
    }
    tickContext.addTickable(note);
    return note;
});

tickContext.preFormat().setX(400)

const visibleNoteGroups: any[] = [];

// Add a note to the staff from the notes array (if there are any left).
document.getElementsByTagName("button")[0].addEventListener("click", (e) => {
    const note = notes.shift();
    if (!note) {
        console.log("DONE!");
        return;
    }
    const group = context.openGroup();
    visibleNoteGroups.push(group);
    note.draw();
    context.closeGroup();
    group.classList.add("scroll");

    // Force a DOM-refresh by asking for the group's bounding box. Why? Most
    // modern browsers are smart enough to realize that adding .scroll class
    // hasn't changed anything about the rendering, so they wait to apply it
    // at the next dom refresh, when they can apply any other changes at the
    // same time for optimization. However, if we allow that to happen,
    // then sometimes the note will immediately jump to its fully transformed
    // position -- because the transform will be applied before the class with
    // its transition rule.
    group.getBoundingClientRect();
    group.classList.add("scrolling");

    // If a user doesn't answer in time, make the note fall below the staff.
    window.setTimeout(() => {
        const index = visibleNoteGroups.indexOf(group);
        if (index === -1) return;
        group.classList.add("too-slow");
        visibleNoteGroups.shift();
    }, 5000);
});