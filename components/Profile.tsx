import { useSelected } from "@/app/_layout";
import { Student } from "@/utils/algorithm";
import { Pressable, Text, View } from "react-native";

export const Profile = ({name, school, gender}: Student) => {
    const {selected, setSelected} = useSelected()
    return(<Pressable
            onHoverIn={() => setSelected(name)}
            onHoverOut={() => setSelected('')}
            style={{padding:4, minWidth:150, flexDirection:'row', borderWidth:2, borderColor:'#cccccc', height:30, width:150, backgroundColor:(name==selected ? '#66FF66' : 'white'), borderRadius:10, margin:3, alignItems:'center'}}>
        <Text style={{fontSize:14}}>{name}</Text>
        <Text style={{fontSize:10, color:'#666666', marginLeft:5}}>{school}/{gender}</Text>
    </Pressable>)
}

export const ProfileInfo = ({name, school, gender}: Student) => {
    return(<View style={{borderWidth:2, borderColor:'#cccccc', height:70, width:'100%', backgroundColor:'white', borderRadius:10, marginVertical:10, justifyContent:'center', alignItems:'center'}}>
        <Text style={{fontSize:20}}>{name}</Text>
        <Text style={{fontSize:13, color:'#666666'}}>{school}/{gender}</Text>
    </View>)
}