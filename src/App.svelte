<script>
  import { onMount } from "svelte";
  import { Color, Editor, Transform, Vector2, Vector3, Vertex } from "./editor";

  let canvas;
  let editor;

  onMount(() => {
    editor = new Editor(canvas);

    const a = editor.createTriangle(
      new Transform(new Vector2(0.2, 0.2), Math.PI / 6, 1),
      [
        new Vertex(Vector2.zero, new Vector3(1, 0.62, 0)),
        new Vertex(new Vector2(0.5, 0.5), new Vector3(1, 0.62, 0)),
        new Vertex(new Vector2(0.5, 0), new Vector3(1, 0.62, 0)),
      ]
    );
    a.isHidden = true;

    const triangle = editor.createTriangle(Transform.origin, [
      new Vertex(Vector2.zero, new Vector3(1, 0, 0)),
      new Vertex(new Vector2(0.5, 0.5), new Vector3(0, 1, 0)),
      new Vertex(new Vector2(0.5, 0), new Vector3(0, 0, 1)),
    ]);
    triangle.isHighlighted = true;
    triangle.isHidden = true;

    const sq = editor.createSquare(Transform.origin, 0.25);
    sq.vertices[1].color = Color.red;
    sq.vertices[2].color = Color.blue;
    sq.vertices[3].color = Color.green;
    sq.size = 0.25;
    // sq.transform.rotation = Math.PI / 4;
    // sq.vertices[0].position.y = 0;
    // console.log(sq.data);
    // debugger;

    const ln = editor.createLine(Transform.origin, 0.4);
    const rect = editor.createRectangle(Transform.origin, 0.6, 0.2);

    window["sq"] = sq;
    window["ln"] = ln;
    window["rect"] = rect;
  });
</script>

<canvas bind:this={canvas} width="1920" height="1920" />

<style>
  canvas {
    height: 540px;
    width: 540px;
  }
</style>
