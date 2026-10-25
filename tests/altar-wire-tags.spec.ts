import { MAX_WIRE_BLOCKS, tagWireBlocks } from "@/components/altar/projection/wireTags";

function fixture(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

describe("tagWireBlocks", () => {
  it("tags text, boxes and image wrappers", () => {
    const root = fixture(`
      <h2 id="h">Title</h2>
      <p id="p">Body</p>
      <div id="card" class="rounded-2xl p-4"></div>
      <div id="bordered" class="border border-white/10"></div>
      <a id="link" href="/x">Link</a>
      <div id="wrap"><img alt="" src="/a.png" /></div>
      <div id="plain"></div>
    `);
    tagWireBlocks(root);
    const wire = (id: string) => root.querySelector(`#${id}`)!.getAttribute("data-wire");
    expect(wire("h")).toBe("text");
    expect(wire("p")).toBe("text");
    expect(wire("card")).toBe("box");
    expect(wire("bordered")).toBe("box");
    expect(wire("link")).toBe("box");
    expect(wire("wrap")).toBe("img");
    expect(wire("plain")).toBeNull();
  });

  it("tags semantic boxes: article, section, li", () => {
    const root = fixture(`<article id="a"></article><section id="s"></section><ul><li id="l"></li></ul>`);
    tagWireBlocks(root);
    for (const id of ["a", "s", "l"]) expect(root.querySelector(`#${id}`)!.getAttribute("data-wire")).toBe("box");
  });

  it("does not tag an image wrapper with more than one element child", () => {
    const root = fixture(`<div id="wrap"><img alt="" src="/a.png" /><span></span></div>`);
    tagWireBlocks(root);
    expect(root.querySelector("#wrap")!.getAttribute("data-wire")).toBeNull();
  });

  it("skips anything inside an already-tagged text element", () => {
    const root = fixture(`<h2 id="h">Hi <span class="rounded">x</span><p id="inner">in</p></h2>`);
    tagWireBlocks(root);
    expect(root.querySelector("#h")!.getAttribute("data-wire")).toBe("text");
    expect(root.querySelector("#inner")!.getAttribute("data-wire")).toBeNull();
    expect(root.querySelector("span")!.getAttribute("data-wire")).toBeNull();
  });

  it("never tags an <img> itself", () => {
    const root = fixture(`<img class="rounded-lg border-2" alt="" src="/a.png" /><img alt="" src="/b.png" /><p>x</p>`);
    expect(tagWireBlocks(root)).toBe(1);
    expect(root.querySelectorAll("img[data-wire]")).toHaveLength(0);
  });

  it("returns the count and caps it at max", () => {
    const root = fixture(Array.from({ length: 10 }, () => "<p>x</p>").join(""));
    expect(tagWireBlocks(root, 4)).toBe(4);
    expect(root.querySelectorAll("[data-wire]")).toHaveLength(4);
  });

  it("defaults to MAX_WIRE_BLOCKS", () => {
    expect(MAX_WIRE_BLOCKS).toBe(80);
    const root = fixture(Array.from({ length: 100 }, () => "<p>x</p>").join(""));
    expect(tagWireBlocks(root)).toBe(80);
  });

  it("is idempotent", () => {
    const root = fixture(`<h2>a</h2><div class="rounded"><p>b</p></div><div><img alt="" src="/a.png" /></div>`);
    const first = tagWireBlocks(root);
    const snapshot = root.innerHTML;
    tagWireBlocks(root);
    expect(root.innerHTML).toBe(snapshot);
    expect(root.querySelectorAll("[data-wire]")).toHaveLength(first);
  });
});
