import { StyleSheet } from '@react-pdf/renderer'

export default StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  flex_container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'normal',
    alignItems: 'normal',
    alignContent: 'normal',
  },
  flex_items: {
    marginVertical: 27,
    marginLeft: 10,
  },
  profile_img: {
    height: '50px',
    width: '50px',
    // marginVertical: 15,
  },
  profile_text_container: {
    display: 'flex',
    backgroundColor: 'green',
  },
  profile_title: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#383b38',
    fontSize: 12,
  },
  profile_sub_title: {
    color: '#383b38',
    fontSize: 11,
  },
  contentSection: {
    display: 'flex',
    alignItems: 'center',
  },
  reportTitleSection: {
    fontSize: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
})
