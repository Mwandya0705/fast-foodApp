import {Account, Avatars, Client, Databases, ID, Query , Storage} from "react-native-appwrite";
import {CreateUserParams, GetMenuParams, SignInParams} from "@/type";
import {error} from "@expo/fingerprint/cli/build/utils/log";


export const appwriteConfig ={
    endpoint:process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform:"com.pamtech.fastfood",
    projectId:process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId:'68a2e7db002e7594ea14',
    bucketId:'68ac3055000de51e4d30',
    userCollectionId:'68a2e82b002f7d740f2e',
    categoriesCollectionId:'68ac29cd0026b32665db',
    menuCollectionId:'68ac2ad60011006b1f15',
    customizationsCollectionId:'68ac2cdb0035eae00d4a',
    menuCustomizationsCollectionId:'68ac2e4d000c32aedadf'
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject (appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const avatars = new Avatars(client);

export const createUser =async({email,password,name}:CreateUserParams) => {
    try{
        const newAccount = await account.create(ID.unique(), email, password , name);
        if (!newAccount) throw Error;

        await signIn({ email,password});

        const avatarUrl =avatars.getInitialsURL(name)
        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                email ,
                name ,

                accountId: newAccount.$id,

                avatar:avatarUrl
            }
        );


    }catch(e){
        throw new Error( e as string)
    }
}

export const signIn =async({email,password}:SignInParams) => {
        try{
            const session = await  account.createEmailPasswordSession(email, password);
        }
    catch (e){
            throw new Error( e as string)
    }
}

export const getCurrentUser =async()=>{
    try{
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )
        if (!currentUser) throw Error;
        return currentUser.documents[0];
    }
    catch (e){
        console.log( error);
        throw new Error(e as string);
    }

}

export const getMenu = async({category,query}:GetMenuParams)=>{
    try{
        const queries:string[]=[];

        if(category) queries.push(Query.equal('categories','category'));
        if(query) queries.push(Query.search('name','query'));

        const menus= await  databases.listDocuments(

            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,

    )
        return menus.documents;

    }
    catch (e){
        throw new Error( e as string);
    }
}

export const getCategories = async () =>{
    try{
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        );
    }
    catch (e){
        throw new Error( e as string);
    }
}