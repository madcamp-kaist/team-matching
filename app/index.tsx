import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { isLoaded } from 'expo-font';
import { useState } from 'react';


import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import * as XLSX from 'xlsx';
import { Profile } from '@/components/Profile';
import { useSelected } from './_layout';
import { Matching, Student, match } from '@/utils/algorithm';
import { Entypo } from '@expo/vector-icons';

export default function TabOneScreen() {
  const mock_students: Student[] = [
    { name: "학생01", school: "GIST", gender: '남' },
    { name: "학생02", school: "KAIST", gender: '남' },
    { name: "학생03", school: "KAIST", gender: '남' },
    { name: "학생04", school: "KAIST", gender: '남' },
    { name: "학생05", school: "KAIST", gender: '여' },
    { name: "학생06", school: "숙명여자대학교", gender: '여' },
    { name: "학생07", school: "전남대학교", gender: '여' },
    { name: "학생08", school: "한양대학교", gender: '남' },
    { name: "학생09", school: "성균관대학교", gender: '여' },
    { name: "학생10", school: "GIST", gender: '남' },
    { name: "학생11", school: "KAIST", gender: '남' },
    { name: "학생12", school: "KAIST", gender: '여' },
    { name: "학생13", school: "KAIST", gender: '남' },
    { name: "학생14", school: "KAIST", gender: '남' },
    { name: "학생15", school: "고려대학교", gender: '남' },
    { name: "학생16", school: "성균관대학교", gender: '남' },
    { name: "학생17", school: "한양대학교", gender: '여' },
    { name: "학생18", school: "포항공과대학교", gender: '남' },
    { name: "학생19", school: "한양대학교", gender: '남' },
    { name: "학생20", school: "KAIST", gender:'여'},
  ]

  const [students, setStudents] = useState<Student[]>([])
  const [matching, setMatching] = useState<Matching[]>([[], []]);
  const [seed, setSeed] = useState('')
  const { selected } = useSelected()

  const readExcel = async (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) return;
      const bufferArray = e.target.result;
      const fileInformation = XLSX.read(bufferArray, {
        type: 'buffer',
        cellText: false,
        cellDates: true,
      });
      const sheetName = fileInformation.SheetNames[0];
      const rawData = fileInformation.Sheets[sheetName];
      const data: Student[] = XLSX.utils.sheet_to_json(rawData);
      const students: Student[] = []
      for (let i = 0; i < data.length; i++) {
        students.push(data[i])
      }
      setStudents(students)
    };
  };

  const fileUpload = () => {
    DocumentPicker.getDocumentAsync({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }).then(
      v => {
        if (!v.canceled) {
          const file = v.assets[0].file
          if (file) readExcel(file)
        }
      }
    )
  }

  const unmatched = {
    gender: matching.map(v => v.filter(([v1, v2]) => v1.gender == v2.gender).flat()),
    kaist: matching.map(v => v.filter(([v1, v2]) => v1.school != "KAIST" && v2.school != "KAIST").flat())
  }

  const unmatched_all = {
    gender: unmatched.gender[0].filter(v => unmatched.gender[1].includes(v)),
    kaist: unmatched.kaist[0].filter(v => unmatched.kaist[1].includes(v)),
  }


  return (
    <View style={[styles.container, { flexDirection: 'row' }]}>
      <View style={{ flex: 1, padding: 20, overflow: 'scroll', height: '100%', alignItems: 'center' }}>
        {students.length == 0 && <View style={{ flex: 1, justifyContent: 'center' }}><Text>{`학생 명단이 없습니다`}</Text></View>}
        {students.map((v, i) => <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#cccccc', width: 190, borderRadius: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, flex: 1, textAlign: 'center', marginLeft: 3 }}>#{i + 1}</Text>
            <Profile {...v} />
          </View>
        </View>)}
      </View>

      <View style={{ flex: 1, padding: 20, backgroundColor: '#f8f8f8', height: '100%', justifyContent: 'center' }}>
        <Button title='명단 양식 다운로드' onPress={() => Linking.openURL('https://teammatching.madcamp.io/form')} />
        <View style={{ padding:10, alignItems:'center', justifyContent:'center' }}>
          <Entypo name="chevron-down" size={50} color="#666666" />
        </View>
        <Button title='명단 업로드' onPress={fileUpload} />
        <View style={{ height: 5 }}></View>
        <Button title='예시 명단 사용해보기' onPress={() => setStudents(mock_students)} color="#bbbbbb" />
        <View style={{ padding:10, alignItems:'center', justifyContent:'center' }}>
          <Entypo name="chevron-down" size={50} color="#666666" />
        </View>
        {/*<TextInput placeholder='시드(옵션)' placeholderTextColor='#666666' onChangeText={setSeed} value={seed} style={{padding:10, borderWidth:1, borderRadius:10, borderColor:'#666666'}}/>*/}
        <View style={{ height: 5 }}></View>
        <Button title='매칭 생성' onPress={() => setMatching(match(students, seed.length > 0 ? seed : undefined))} />
      </View>


      <View style={{ flex: 4, height:'100%' }}>
        <View style={{ flex: 4, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          {[0, 1].map(week => <View style={{ flex: 1, padding: 20, alignItems: 'center', height: '100%' }}>
            <Text style={{ fontSize: 20, fontWeight:'bold'}}>{week + 1}주차</Text>
            {matching[week].map(([v1, v2]) => <View style={{ flexDirection: 'row', width: 315, marginVertical: 3, backgroundColor: '#cccccc', justifyContent: 'space-between', borderRadius: 10 }}> <Profile {...v1} /> <Profile {...v2} /> </View>)}


          </View>)}

        </View>
        {matching.flat().length > 0 && <View style={{ backgroundColor: '#dddddd', padding:20 }}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}>
              <Text style={{fontWeight:'bold'}}>매칭 결과</Text>
              <Text>한 번도 KAIST와 팀을 할 수 없는 사람 수 : {unmatched_all.kaist.length}</Text>
              <Text>한 번도 이성과 팀을 할 수 없는 사람 수 : {unmatched_all.gender.length}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontWeight:'bold'}}>세부 결과</Text>
              <Text>1주차에 KAIST와 팀을 할 수 없는 사람 수 : {unmatched.kaist[0].length}</Text>
              <Text>2주차에 KAIST와 팀을 할 수 없는 사람 수 : {unmatched.kaist[1].length}</Text>
              <Text>1주차에 이성과 팀을 할 수 없는 사람 수 : {unmatched.gender[0].length}</Text>
              <Text>2주차에 이성과 팀을 할 수 없는 사람 수 : {unmatched.gender[1].length}</Text>
            </View>
          </View>
        </View>}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
