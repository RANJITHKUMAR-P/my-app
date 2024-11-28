import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { DeleteFile, UploadFile, creationData, updatationData } from './common'

export const GetserviceSnapshot = async serviceSnapshot => {
  let services = []
  try {
    if (serviceSnapshot) {
      serviceSnapshot.forEach(doc => {
        const service = doc.data()
        services.push({
          id: doc.id,
          ...service,
        })
      })
    }
  } catch (error) {
    console.log({ error })
  }
  return services
}

const AddListener = async (
  hotelId,
  dispatch,
  listenerAdded,
  listenerAddedAction,
  setDataAction,
  collectionName
) => {
  try {
    let collectionKey = `AddListener_${collectionName}`
    if (hotelId && !listenerAdded && !unsubscribeList[collectionKey]) {
      dispatch(listenerAddedAction(true))
      let unSub = db
        .collection(collectionName)
        .where('hotelId', '==', hotelId)
        .where('isDelete', '==', false)
        .onSnapshot(snapShot => {
          let docs = []
          for (const obj of snapShot.docs) {
            docs.push({ id: obj.id, ...obj.data() })
          }
          dispatch(setDataAction(docs))
        })

      unsubscribeList[collectionKey] = unSub
    }
  } catch (error) {
    console.log(error)
  }
}

export const AddSpaListener = (hotelId, spaListenerAdded, dispatch) => {
  AddListener(
    hotelId,
    dispatch,
    spaListenerAdded,
    actions.setSpaListenerAdded,
    actions.setSpa,
    Collections.SPA
  )
}

export const AddSaloonListener = (hotelId, saloonListenerAdded, dispatch) => {
  AddListener(
    hotelId,
    dispatch,
    saloonListenerAdded,
    actions.setSaloonListenerAdded,
    actions.setSaloon,
    Collections.SALOON
  )
}

export const AddGymListener = (hotelId, gymListenerAdded, dispatch) => {
  AddListener(
    hotelId,
    dispatch,
    gymListenerAdded,
    actions.setGymListenerAdded,
    actions.setGym,
    Collections.GYM
  )
}

export const CreateService = async (service, image) => {
  // upload hotel logo
  let imageUrl = ''
  let imageNameValue = ''
  if (image) {
    const {
      success: uploadFileSuccess,
      downloadUrl,
      message: uploadFileMessage,
      profileImageName: imageName,
    } = await UploadFile(image, 'profileImages')
    if (!uploadFileSuccess)
      return { success: false, message: uploadFileMessage }
    imageUrl = downloadUrl
    imageNameValue = imageName
  }
  if (service && service.serviceName === 'Spa') {
    try {
      await db
        .collection(Collections.SPA)
        .doc()
        .set({
          ...service,
          imageUrl: imageUrl,
          imageName: imageNameValue,
          ...creationData(),
        })

      return { success: true, message: 'Spa details added successfully' }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
      return { success: false, message: error?.message }
    }
  }
  if (service && service.serviceName === 'Gym') {
    try {
      await db
        .collection(Collections.GYM)
        .doc()
        .set({
          ...service,
          imageUrl: imageUrl,
          imageName: imageNameValue,
          ...creationData(),
        })

      return { success: true, message: 'Gym details added successfully' }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
      return { success: false, message: error?.message }
    }
  }
  if (service && service.serviceName === 'Saloon') {
    try {
      await db
        .collection(Collections.SALOON)
        .doc()
        .set({
          ...service,
          imageUrl: imageUrl,
          imageName: imageNameValue,
          ...creationData(),
        })

      return { success: true, message: 'Saloon details added successfully' }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
      return { success: false, message: error?.message }
    }
  }
}

export const EditService = async ({
  service,
  serviceId,
  image,
  imageUrl,
  deleteImage,
  imageName,
}) => {
  let response
  let newImageUrl = imageUrl
  let newImageName = imageName

  try {
    // Update new profile image
    if (image) {
      const {
        success: uploadFileSuccess,
        downloadUrl,
        message: uploadFileMessage,
        profileImageName: logo,
      } = await UploadFile(image, 'profileImages')

      if (!uploadFileSuccess)
        return { success: false, message: uploadFileMessage }

      newImageUrl = downloadUrl
      newImageName = logo
    }

    // Update service details
    let collectionName
    switch (service?.serviceName) {
      case 'Spa':
        collectionName = Collections.SPA
        break
      case 'Saloon':
        collectionName = Collections.SALOON
        break
      case 'Gym':
        collectionName = Collections.GYM
        break
      default:
        return { success: false, message: 'Invalid service name' }
    }

    await db.collection(collectionName).doc(serviceId).update({
      ...service,
      imageUrl: newImageUrl,
      imageName: newImageName,
      ...updatationData(),
    })

    // Delete old profile image only if the update is successful
    if (deleteImage && imageName) {
      response = await DeleteFile(imageName)
      if (!response.success) {
        return { success: false, message: response.message }
      }
    }

    return { success: true, message: `${service.serviceName} details edited successfully` }
  } catch (error) {
    console.error({ error })
    console.error(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteService = async (serviceId, serviceName) => {
  if (serviceName === 'Spa') {
    try {
      await db
        .collection(Collections.SPA)
        .doc(serviceId)
        .update({ isDelete: true, ...updatationData() })
      return { success: true, message: 'Spa details deleted successfully' }
    } catch (error) {
      console.log({ error })
      console.log(error)
      return { success: false, message: error?.message }
    }
  }
  if (serviceName === 'Saloon') {
    try {
      await db
        .collection(Collections.SALOON)
        .doc(serviceId)
        .update({ isDelete: true, ...updatationData() })
      return { success: true, message: 'Saloon details deleted successfully' }
    } catch (error) {
      console.log({ error })
      console.log(error)
      return { success: false, message: error?.message }
    }
  }
  if (serviceName === 'Gym') {
    try {
      await db
        .collection(Collections.GYM)
        .doc(serviceId)
        .update({ isDelete: true, ...updatationData() })
      return { success: true, message: 'Gym details deleted successfully' }
    } catch (error) {
      console.log({ error })
      console.log(error)
      return { success: false, message: error?.message }
    }
  }
}

// Common function to get data from snapshot
const getDataFromSnapshot = (snapshot, transformFunction) => {
  let data = [];
  try {
    if (snapshot) {
      snapshot.forEach(doc => {
        const item = transformFunction(doc);
        data.push({
          id: doc.id,
          ...item,
        });
      });
    }
  } catch (error) {
    console.log({ error });
  }
  return data;
};

// Function to fetch data from Firestore
const fetchDataFromFirestore = async (collection, hotelId, transformFunction) => {
  let data = [];
  try {
    const snapshot = await db
      .collection(collection)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .get();
    if (snapshot) {
      data = getDataFromSnapshot(snapshot, transformFunction);
    }
  } catch (error) {
    console.log({ error });
  }
  return data;
};

// Transform function for spa, gym, and saloon
const transformSpa = doc => doc.data();
const transformGym = doc => doc.data();
const transformSaloon = doc => doc.data();

// Functions to get spa, gym, and saloon data
export const GetSpa = async hotelId => {
  return await fetchDataFromFirestore(Collections.SPA, hotelId, transformSpa);
};

export const GetGym = async hotelId => {
  return await fetchDataFromFirestore(Collections.GYM, hotelId, transformGym);
};

export const GetSaloon = async hotelId => {
  return await fetchDataFromFirestore(Collections.SALOON, hotelId, transformSaloon);
};

// Common function for advanced menu upload and delete
const performMenuOperation = async (collection, id, menu, operation) => {
  try {
    await db
      .collection(collection)
      .doc(id)
      .update({ menu: menu, ...updatationData() });

    return { success: true, message: `Menu ${operation} successfully` };
  } catch (error) {
    console.log({ error });
    console.log(error?.message);
    return { success: false, message: error?.message };
  }
};

// Advanced menu upload functions
export const UploadSpaMenuAdvanced = async (id, menu) => {
  return await performMenuOperation(Collections.SPA, id, menu, 'uploaded');
};

export const UploadSaloonMenuAdvanced = async (id, menu) => {
  return await performMenuOperation(Collections.SALOON, id, menu, 'uploaded');
};

export const UploadGymMenuAdvanced = async (id, menu) => {
  return await performMenuOperation(Collections.GYM, id, menu, 'uploaded');
};

// Advanced menu delete functions
export const DeleteSpaMenu = async id => {
  return await performMenuOperation(Collections.SPA, id, '', 'deleted');
};

export const DeleteGymMenu = async id => {
  return await performMenuOperation(Collections.GYM, id, '', 'deleted');
};

export const DeleteSaloonMenu = async id => {
  return await performMenuOperation(Collections.SALOON, id, '', 'deleted');
};

