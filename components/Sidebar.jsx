import { useEffect, useState } from "react";
import styled from "styled-components";
import { Avatar, IconButton, Button } from "@material-ui/core";
import {
   Chat as ChatIcon,
   MoreVert as MoreVertIcon,
   Search as SearchIcon,
} from "@material-ui/icons";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import {
   collection,
   addDoc,
   query,
   where,
   onSnapshot,
} from "@firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

const Sidebar = () => {
   const [user] = useAuthState(auth);
   const [usersList, setUsersList] = useState([]);

   const getUsersChat = (userEmail) => {
      const q = query(
         collection(db, "chats"),
         where("users", "array-contains", userEmail)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         const users = [];
         querySnapshot.forEach((doc) => {
            users.push(doc.data().users);
         });
         if (users.length > 0) {
            setUsersList(users);
         }
      });
   };

   useEffect(() => {
      if (user) getUsersChat(user.email);
   }, [user]);

   const createChat = async () => {
      const input = prompt(
         "Please enter an email address for the user you wish to chat with"
      );

      if (!input) return;

      if (
         EmailValidator.validate(input) &&
         input !== user.email &&
         !chatAlreadyExist(input)
      ) {
         // TODO: We need to add chat into DB 'chats' collection

         try {
            const docRef = await addDoc(collection(db, "chats"), {
               users: [user.email, input],
            });
            console.log("Document written with ID: ", docRef.id);
            return;
         } catch (e) {
            console.error("Error adding document: ", e);
            return;
         }
      }
      alert("Chat already created with this user!");
   };

   const chatAlreadyExist = (recipientEmail) =>
      usersList.filter((users) => users.includes(recipientEmail)).length > 0
         ? true
         : false;

   return (
      <Container>
         <Header>
            <UserAvatar onClick={() => auth.signOut()} />

            <IconsContainer>
               <IconButton>
                  <ChatIcon />
               </IconButton>

               <IconButton>
                  <MoreVertIcon />
               </IconButton>
            </IconsContainer>
         </Header>

         <Search>
            <SearchIcon />
            <SearchInput placeholder="Search in chats" />
         </Search>

         <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

         {/* TODO: List of chats */}
      </Container>
   );
};

export default Sidebar;

const Container = styled.div``;

const Header = styled.div`
   display: flex;
   position: sticky;
   top: 0;
   background-color: #fff;
   z-index: 1;
   justify-content: space-between;
   align-items: center;
   padding: 15px;
   height: 80px;
   border-bottom: 3px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
   cursor: pointer;
   :hover {
      opacity: 0.8;
   }
`;

const Search = styled.div`
   display: flex;
   align-items: center;
   padding: 5px;
   border-radius: 2px;
`;

const IconsContainer = styled.div``;

const SearchInput = styled.input`
   outline-width: 0;
   border: none;
   flex: 1;
   margin-left: 5px;
`;

const SidebarButton = styled(Button)`
   width: 100%;
   &&& {
      border-bottom: 2px solid whitesmoke;
      border-top: 2px solid whitesmoke;
   }
`;
