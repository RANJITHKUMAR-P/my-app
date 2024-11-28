import { useEffect, useState } from 'react'
import {
  LightgalleryProvider,
  LightgalleryItem,
  useLightgallery,
} from 'react-lightgallery'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const OpenButtonWithHook = ({
  buttonStyle,
  viewText = 'View',
  ...restProps
}) => {
  const { openGallery } = useLightgallery()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return (
    <a
      {...restProps}
      onClick={() => openGallery('group1')}
      className='viewlink ml-0 mr-0'
      rel='noopener noreferrer'
      style={buttonStyle}
    >
      {translateTextI18N(viewText)}
    </a>
  )
}

const MenuGallery = ({ menu, style, description = '', viewText = 'View' }) => {
  const [images, setImages] = useState([])

  useEffect(() => {
    menu && setImages(menu)
  }, [menu])

  const PhotoItem = ({ image, group }) => (
    <div className='col-4'>
      <LightgalleryItem group={group} src={image}>
        <img
          alt={'alt'}
          src={image}
          style={{ width: '100%', height: '100%' }}
        />
      </LightgalleryItem>
    </div>
  )

  return (
    <>
      <LightgalleryProvider>
        <div className='form-row' style={{ display: 'none' }}>
          {images.map((p, idx) => (
            <PhotoItem key={idx} image={p.url} group='group1' />
          ))}
        </div>
        <OpenButtonWithHook buttonStyle={style} viewText={viewText} />{' '}
        {description}
      </LightgalleryProvider>
    </>
  )
}

export default MenuGallery
