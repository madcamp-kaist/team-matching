import { Queue } from "@datastructures-js/queue";
export type Student = {
  name: string;
  gender: "남" | "여";
  school: string;
};

type Edge = {
  next: number;
  cost: number;
};

type Graph = {
  n: number; // number of nodes in graph
  source: number;
  sink: number;
  dummy: number;
  C: number[][];
  F: number[][];
  v: Edge[][];
  majorities: Student[];
  minorities: Student[];
};

const NUM_DUMMY = 8;

const make_graph = (students: Student[]) => {
  let majorities = students.filter(({ school }) => school == "KAIST");
  let minorities = students.filter(({ school }) => school != "KAIST");

  if (majorities.length < minorities.length)
    [majorities, minorities] = [minorities, majorities];

  const n = majorities.length;
  const m = minorities.length;
  const node_cnt = NUM_DUMMY * n + NUM_DUMMY * m + 4;
  const dummy2 = NUM_DUMMY * n + NUM_DUMMY * m + 3;
  const dummy = NUM_DUMMY * n + NUM_DUMMY * m + 2;
  const sink = NUM_DUMMY * n + NUM_DUMMY * m + 1;

  let C: number[][] = [];
  let F: number[][] = [];
  let v: Edge[][] = [];
  for (let i = 0; i < node_cnt; i++) C.push(new Array<number>(node_cnt));
  for (let i = 0; i < node_cnt; i++) F.push(new Array<number>(node_cnt));
  for (let i = 0; i < node_cnt; i++) v.push(new Array<Edge>());
  for (let i = 0; i < node_cnt; i++)
    for (let j = 0; j < node_cnt; j++) C[i][j] = F[i][j] = 0;

  const add_edge = (
    from: number,
    to: number,
    cost: number,
    capacity: number
  ) => {
    v[from].push({ next: to, cost });
    v[to].push({ next: from, cost: -cost });
    C[from][to] = capacity;
  };

  // source -> major
  for (let i = 1; i <= n; i++) {
    add_edge(0, NUM_DUMMY * i, 0, 2);
  }

  // major -> gender
  for (let i = 1; i <= n; i++) {
    const start = NUM_DUMMY * i;
    const isMale = majorities[i - 1].gender == "남";
    const male = {
      end: start - 1,
      dummy: [start - 3, start - 4],
    };
    const female = {
      end: start - 2,
      dummy: [start - 5, start - 6],
    };
    const inside_dummy = start - 7;

    add_edge(start, male.dummy[0], 0, 1);
    add_edge(start, female.dummy[0], 0, 1);
    add_edge(male.dummy[0], male.end, isMale ? 0 : 0, 1);
    add_edge(female.dummy[0], female.end, !isMale ? 0 : 0, 1);

    add_edge(
      isMale ? male.dummy[0] : female.dummy[0],
      inside_dummy,
      isMale ? 100 : 99,
      1
    );
    add_edge(
      !isMale ? male.dummy[0] : female.dummy[0],
      inside_dummy,
      isMale ? 10000 : 9900,
      1
    );

    add_edge(inside_dummy, dummy, 0, 1);

    add_edge(start, male.dummy[1], 0, 1);
    add_edge(start, female.dummy[1], 0, 1);
    add_edge(male.dummy[1], male.end, isMale ? 1000000 : -1, 1);
    add_edge(female.dummy[1], female.end, !isMale ? 1000000 : -1, 1);
  }

  // gender -> minor
  for (let i = 1; i <= m; i++) {
    const end = NUM_DUMMY * n + NUM_DUMMY * i;
    const male = {
      start: end - 1,
      dummy: [end - 3, end - 4],
    };
    const female = {
      start: end - 2,
      dummy: [end - 5, end - 6],
    };
    const isMale = minorities[i - 1].gender == "남";
    /*const minor = NUM_DUMMY*n + NUM_DUMMY*i
      const male = minor - 1
      const female = minor - 2
      const male_dummy = minor - 3
      const female_dummy = minor - 4*/

    add_edge(male.start, end, isMale ? 0 : 0, 1);
    add_edge(female.start, end, !isMale ? 0 : 0, 1);

    add_edge(male.start, male.dummy[1], isMale ? 1000000 : -1, 1);
    add_edge(female.start, female.dummy[1], !isMale ? 1000000 : -1, 1);

    add_edge(male.dummy[1], end, 0, 1);
    add_edge(female.dummy[1], end, 0, 1);
  }

  // gender -> gender
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const from = NUM_DUMMY * i - (minorities[j - 1].gender == "남" ? 1 : 2);
      const to =
        NUM_DUMMY * (n + j) - (majorities[i - 1].gender == "남" ? 1 : 2);
      add_edge(from, to, 0, 1);
    }
  }

  // minor -> sink
  for (let j = 1; j <= m; j++) {
    add_edge(NUM_DUMMY * (n + j), sink, 0, 2);
  }

  // major -> dummy
  /*for(let i=1;i<=n;i++) {
      add_edge(NUM_DUMMY*i - (majorities[i-1].gender == "남" ? 1 : 2), dummy, 0, 1) // 5*i-1?
    }*/

  // dummy -> sink
  add_edge(dummy, sink, 100000000, 100);

  const graph: Graph = {
    C,
    F,
    source: 0,
    sink,
    dummy,
    v,
    n: node_cnt,
    majorities,
    minorities,
  };
  return graph;
};

const mcmf = ({ n, source, sink, C, F, v }: Graph) => {
  let cnt = 0;
  let ans = 0;

  while (true) {
    let prev = new Array<number>(n);
    let d = new Array<number>(n);
    let inq = new Array<boolean>(n);

    for (let i = 0; i < n; i++) {
      inq[i] = false;
      prev[i] = -1;
      d[i] = 1000000000;
    }

    let q = new Queue<number>();
    d[source] = 0;
    q.push(source);
    inq[source] = true;

    while (!q.isEmpty()) {
      const cur = q.front();
      q.pop();
      inq[cur] = false;

      for (let i = 0; i < v[cur].length; i++) {
        const x = v[cur][i];
        const next = x.next;
        const cost = x.cost;
        if (C[cur][next] - F[cur][next] <= 0) {
          continue;
        }
        if (d[next] > d[cur] + cost) {
          prev[next] = cur;
          d[next] = d[cur] + cost;
          if (!inq[next]) {
            q.push(next);
            inq[next] = true;
          }
        }
      }
    }
    if (prev[sink] == -1) break;
    let flow = 1000000000;
    for (let i = sink; i != source; i = prev[i])
      flow = Math.min(flow, C[prev[i]][i] - F[prev[i]][i]);
    for (let i = sink; i != source; i = prev[i]) {
      F[prev[i]][i] += flow;
      F[i][prev[i]] -= flow;
    }
    cnt += flow;
    ans += d[sink] * flow;
  }
  console.log(cnt, ans);
};

type Team = [Student, Student] | [Student, Student, Student];
export type Matching = Team[];
export const match = (students: Student[], seed?: string) => {
  let graph = make_graph(students);

  mcmf(graph);

  const n = graph.majorities.length;
  const m = graph.minorities.length;
  const F = graph.F;
  const a: Student[] = [
    ...graph.majorities,
    ...graph.minorities,
    { name: "dummy", school: "dummy", gender: "남" },
  ];

  let partners = new Array<number[]>(n + m);
  let dummy_but_matched = new Set<Student>();
  let dummy_not_matched = new Set<Student>();

  for (let i = 0; i < n + m + 1; i++) {
    partners[i] = [];
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const major = NUM_DUMMY * i;
      const minor = NUM_DUMMY * (n + j);
      if (
        F[major - 1][minor - 1] == 1 ||
        F[major - 1][minor - 2] == 1 ||
        F[major - 2][minor - 1] == 1 ||
        F[major - 2][minor - 2] == 1
      ) {
        partners[i - 1].push(n + j - 1);
        partners[n + j - 1].push(i - 1);
        // console.log(i-1, n+j-1)
      }
    }
  }
  for (let i = 0; i < n + m; i++) {
    if (partners[i].length == 1) {
      const next: number = partners[i][0];
      partners[i].push(n + m);
      partners[n + m].push(i);

      if (a[next].gender == a[i].gender) {
        dummy_not_matched.add(a[i]);
      } else {
        dummy_but_matched.add(a[i]);
      }
    }
  }

  let matching: Matching[] = [[], []];
  let unmatched: Student[][] = [[], []]; //[new Set(a), new Set(a)]

  const dfs = (cur: number, week: number, prev?: number) => {
    if (partners[cur].length == 0) return;
    let next = partners[cur][0];
    if (cur == n + m && prev != undefined) {
      let sames = partners[cur].filter((v) => a[v].gender == a[prev].gender);
      if (sames.length > 0) {
        next = sames[0];
      }
    }
    partners[cur].splice(partners[cur].indexOf(next), 1);
    partners[next].splice(partners[next].indexOf(cur), 1);

    // unmatched[week].delete(a[cur])
    // unmatched[week].delete(a[next])

    if (cur != n + m && next != n + m) matching[week].push([a[cur], a[next]]);
    else unmatched[week].push(cur != n + m ? a[cur] : a[next]);
    dfs(next, week == 0 ? 1 : 0, cur);
  };

  for (let i = n; i < n + m; i++) {
    dfs(i, 0);
  }

  //console.log(dummy_but_matched)
  //console.log(dummy_not_matched)

  const isMale = (student: Student) => student.gender == "남";
  const isFemale = (student: Student) => student.gender == "여";
  const containedIn = (set: Set<Student>) => (student: Student) =>
    set.has(student);

  for (let i = 0; i < 2; i++) {
    // week
    let unmatched_males = [
      ...unmatched[i].filter(isMale).filter(containedIn(dummy_but_matched)),
      ...unmatched[i].filter(isMale).filter(containedIn(dummy_not_matched)),
    ];
    let unmatched_females = [
      ...unmatched[i].filter(isFemale).filter(containedIn(dummy_but_matched)),
      ...unmatched[i].filter(isFemale).filter(containedIn(dummy_not_matched)),
    ];
    while (unmatched_females.length > 0 && unmatched_males.length > 0) {
      let female = unmatched_females.pop();
      let male = unmatched_males.pop();
      if (female === undefined || male === undefined) {
        alert("an error occured");
        continue;
      }
      matching[i].push([female, male]);
    }

    let last_one: Student | null = null;

    while (unmatched_females.length >= 2) {
      let [v1, v2] = [unmatched_females.pop(), unmatched_females.pop()];
      if (v1 === undefined || v2 === undefined) {
        alert("an error occured");
        continue;
      }
      matching[i].push([v1, v2]);
    }
    if (unmatched_females.length == 1) last_one = unmatched_females[0];

    while (unmatched_males.length >= 2) {
      let [v1, v2] = [unmatched_males.pop(), unmatched_males.pop()];
      if (v1 === undefined || v2 === undefined) {
        alert("an error occured");
        continue;
      }
      matching[i].push([v1, v2]);
    }
    if (unmatched_males.length == 1) last_one = unmatched_males[0];

    // console.log(last_one)
  }

  // console.log(matching, unmatched)

  return matching;
};
