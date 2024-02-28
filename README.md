# Madcamp Team Matching Algorithm

Try https://teammatching.madcamp.io/

- Developed in React Native Expo Web (Expo SDK 50, Expo Router V3)
- Deployed on Netlify

### utils/algorithm.ts

- main logic for team matching
- **make_graph** constructs graph given array of students - helper function
- **mcmf** runs Minimum Cost Maximum Flow on given graph - helper function
- **match** returns complete matching result given array of students

## Algorithm Description

- 이 알고리즘은 사람을 majority와 minority 두 가지로 구분하며, 다양성을 위해 majority와 minority가 최대한 많이 매칭될 수 있도록 하는 것이 목표이다. 몰입캠프의 경우 majority는 타대생, minority는 KAIST생이다.
- 즉, 이 알고리즘의 목표는 n명의 사람이 주어질 때, 아래의 조건을 만족하는 1주차 팀 n/2개, 2주차 팀 n/2개를 생성하는 것이다.

  - 모든 팀은 2인으로 구성된다.
  - 1주차에 같은 팀을 했던 사람과는 2주차에 같은 팀을 할 수 없다.
  - 모든 majority는 2주 동안 적어도 한 번은 minority와 팀을 해야 한다.
  - 위의 모든 조건을 만족하는 매칭이 여러 개인 경우, 2주 동안 한 번도 이성과 팀을 할 수 없는 사람의 수를 최소화한다.

- 시간복잡도 : O(n^4)

### Example

- 1부터 8까지 번호가 붙은 8명의 사람이 주어진다.
- 1, 2, 3, 4, 5가 majority에 해당하고, 6, 7, 8이 minority에 해당한다고 하자.
- 이 때, 다음과 같은 Bipartite 그래프를 만들고 source에서 sink를 추가하여 최대 유량을 흘린다고 가정하자.
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/6deee6b6-a5ec-421f-88e7-9a7f2431d398)
- 각 간선의 용량은 다음과 같이 설정한다.
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/4f7c1ee6-2219-48a9-92b2-2b1fd25d6c2d)
  - majority 노드에는 2의 유량이 들어올 수 있으며, minority 노드로 이어지는 간선의 용량은 1이므로 최대 유량이 흐르는 경우 majority 노드 하나는 서로 다른 minority 노드 둘과 연결된다. 이는 각각 1주차 팀원, 2주차 팀원이 된다.
  - 마찬가지로, minority 노드에서 sink 노드로는 2의 유량이 흐를 수 있으며, 이에 따라 최대 유량이 흐르는 경우 minority 노드는 서로 다른 majority 노드 둘에서 흐르는 유량을 받아야 함을 알 수 있다. 이는 역시 각각 1주차, 2주차 팀원이 된다.
  - 어쩔 수 없이 매칭에 실패하는 majority 노드의 유량은 dummy 노드로 연결된다. dummy 노드와 연결되는 경우, 1주차나 2주차 둘 중 한번은 minority와 팀을 할 수 없음을 의미한다.
  - dummy 노드에서 sink 노드로 가는 간선의 용량은 무한으로, 몇 명의 majority가 dummy와 연결되어도 상관없음을 의미한다.
  - dummy 노드로 이어지는 간선의 용량은 1로, 1주차와 2주차 중 적어도 한 번은 minority 노드와 연결됨이 보장된다.

- 각 간선의 가중치는 다음과 같이 설정한다.
  
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/10cc008b-1664-4f73-8955-479755ed3eeb)
  - dummy 노드에서 sink 노드로 가는 간선에만 큰 가중치를 둔다.
  - 따라서, 가중치를 최소화한다면 자연스레 dummy 노드와 연결되는 majority 노드의 수가 최소화된다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/ad55d8ea-8108-46e2-a4ba-d9a9c3a6c803)
  - 원한다면, 각 사람들끼리의 연결에 학교나 학번 차이에 따라 custom 가중치를 추가해도 된다.
  - 설정하기에 따라 원하는 수치를 최소화할 수 있다.

- 위 그래프에서 **MCMF**를 돌리고, 유량이 흐르는 간선을 조사하면 어떤 majority 노드와 minority 노드가 연결되었는지 확인할 수 있다.
- 유량이 흐르는 간선, 즉 매칭 결과만 남긴 그래프를 생각해보자.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/eebc5ece-8e98-43eb-88e6-7ae0969548a7)
  - majority 노드와 minority 노드는 그래프 특성 및 MCMF 특성 상 degree가 무조건 2이다.
  - dummy 노드의 degree는 그래프 특성 상 2*(majority 수 - minority 수)이므로, 2의 배수이다.
- 이는 위 그래프에서 **Euler Tour**가 가능함을 의미하며, 경로에 속한 간선의 개수 역시 2의 배수가 된다.
- 따라서, 아래와 같이 임의의 방향으로 Euler Tour를 하며 빨간색과 파란색을 번갈아가며 색칠해보도록 하자.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/71f65c10-e088-41aa-9e92-4bf52481d00e)
  - 이 때, 빨간색 간선은 1주차 팀, 파란색 간선은 2주차 팀으로 생각하면 모든 조건을 만족하며 매칭을 성공할 수 있다.
  - 위 예시와 다르게 모든 노드가 하나의 Connected Component에 포함되지 않을 수 있다. 이 때는 존재하는 모든 Connected Component에 같은 작업을 진행하면 된다.
  - dummy 노드에 연결된 majority 노드는 해당 주차에 minority와 팀을 할 수 없음을 의미한다. 따라서, dummy 노드에 연결된 노드들을 따로 모아 자기들끼리 임의로 매칭해주면 된다.
- 따라서, 위 경우에 1주차 팀은 1-7, 2-6, 3-4, 5-8, 2주차 팀은 1-6, 2-5, 3-8, 4-7이 된다.

### Detail in majority node
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/442ec2d2-205b-4188-b492-53fef294d26a)

- 모든 조건이 만족되는 경우 이성끼리의 팀을 최대화해야 한다.
- 가중치 조절을 위해, 하나의 majority 노드는 실제로는 8개의 내부 노드와 가중치 간선으로 이루어져 있다. 
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/ab5cfd17-dc6d-46be-ac7c-ef6798a86899)
  - 가장 앞 노드에서 sink에서 온 유량을 받는다.
  - minority female로 나가는 노드, minority male로 나가는 노드, dummy 노드로 나가는 노드가 모두 따로 구분된다.
  
- 각 간선의 용량은 다음과 같이 설정한다.
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/309fc85a-b076-4933-a59f-71f6f7156c52)
  - 특별한 점은 없으며, sink에서 2개의 유량을 받아 minority male, minority female, dummy로 나가는 유량의 총 합이 2여야 한다는 사실에는 변함이 없다.

- 각 간선의 가중치는 다음과 같이 설정한다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/8459b2c3-5461-49fb-80f7-65257b505e39)
  - 위 노드가 남성이라고 가정했을 때, 동성으로 연결되는 간선과 이성으로 연결되는 간선은 가중치가 다르다.
  - 이성과 두 번 모두 매칭되는 경우, 아래 그림처럼 어떤 cost도 감수할 필요가 없다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/c7f1705a-df28-44bc-a50d-3ef8234a5680)
  - 이성과 한 번, 동성과 한 번 매칭되는 경우에도 아래 그림처럼 어떤 cost도 감수할 필요가 없다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/7e613787-7e7c-4ae3-aa31-cea0f87b8e58)
  - 동성과 두 번 모두 매칭되는 경우, 아래 그림처럼 **무조건** 매우 큰 cost를 감수해야 한다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/bf466355-64e4-4c62-8226-f578c7df78b8)
  - 이성과 한 번 매칭된 경우, 이성과 한 번, minority와 한 번 매칭되었으므로 매칭에서 요구되는 조건을 이미 만족했다. 따라서 아래 그림처럼 dummy 노드와 연결하더라도 비교적 적은 추가 cost를 발생시킨다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/7b019294-7033-4e3b-ad5e-c5036a1e5924)
  - 동성과 한 번 매칭된 경우, dummy 노드에서 이성과의 매칭을 기대할 수 없으므로 아래 그림처럼 dummy 노드와 연결한다면 비교적 큰 추가 cost를 발생시킨다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/93fcafdb-95c0-4635-8e94-85fceec54cdd)

### Detail in minority node
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/c29d1386-967f-4d6c-8c60-430e76664728)
- 모든 조건이 만족되는 경우 이성끼리의 팀을 최대화해야 한다.
- 가중치 조절을 위해, 하나의 minority 노드는 실제로는 5개의 내부 노드와 가중치 간선으로 이루어져 있다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/a0330fd5-19f4-4ec5-8e1d-615cc1bddebc)
  - majority female에서 들어오는 노드, majority male에서 들어오는 노드가 모두 따로 구분된다.
  - 마지막 노드에서 sink로 나간다.

- 각 간선의 용량은 다음과 같이 설정한다.
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/52362f41-8732-43c9-8ba1-6a19d55550db)
  - 위 majority node의 경우와 비슷하게 구성되었다.

- 각 간선의 가중치는 다음과 같이 설정한다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/61a0d66c-edd1-4b9c-8f64-901f629a9e0e)
  - 마찬가지로 위 majority node의 경우와 비슷하게 구성되었다.
  - 위 노드가 남성이라고 가정했을 때, 동성에서 연결되는 간선과 이성에서 연결되는 간선은 가중치가 다르다.
  - 이성과 두 번 모두 매칭되는 경우, 아래 그림처럼 어떤 cost도 감수할 필요가 없다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/85187415-c845-4449-9aaf-159ebcfd90ac)
  - 이성과 한 번, 동성과 한 번 매칭되는 경우에도 아래 그림처럼 어떤 cost도 감수할 필요가 없다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/768d1668-cd55-43f0-9754-690f403958b6)
  - 동성과 두 번 모두 매칭되는 경우, 아래 그림처럼 **무조건** 매우 큰 cost를 감수해야 한다.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/19e73a75-d7f9-4832-af89-546b258ba8cc)

### Time Complexity

- 위의 그래프 생성 방식을 사용할 때, 정점의 개수는 8*n을 넘지 않으므로 O(n), 간선의 개수는 O(n^2)이다.
- 위 그래프에서 흐를 수 있는 최대 유량은 2*n을 넘지 않으므로 O(n)이다.
- MCMF의 시간 복잡도는 O(VEf)이므로, 최종 시간복잡도는 O(n^4)이다.
