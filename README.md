# SVG Path Playground

Preview the SVG Path feature, get visual help.

The editor was sensitive to the commands typed, you should type in the following format:
```
[Function] [Commands] [Commands]
[Function] [Commands]
...
```

Example:
```
M 5 5
h 5
v 5
h -5
z
```

Wrong:
```
M5 5
h 5 v 5 h -5 z
```

Visual aid for some commands is not good enough: a, t, s (Arch, smooth curve).

Inspiration: [nan.fyi/svg-paths](https://www.nan.fyi/svg-paths)