
import * as tf from '@tensorflow/tfjs'
import { fetch, decodeJpeg } from '@tensorflow/tfjs-react-native'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as jpeg from 'jpeg-js'
import React from 'react'
import { StyleSheet, Image, ImageSourcePropType, ActivityIndicator, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import type { RootTabScreenProps } from '../types'
import { Text, View } from '../components/Themed'
import { Prediction } from '../model'

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
	
	const [ isTfReady, setIsTfReady ] = React.useState<boolean>(false)
	const [ isModelReady, setIsModelReady ] = React.useState<boolean>(false)
	const [ model, setModel ] = React.useState<mobilenet.MobileNet | null>(null)
	const [ image, setImage ] = React.useState<ImageSourcePropType | null>(null)
	const [ predictions, setPredictions ] = React.useState<Prediction[]>([])
	
	React.useEffect(() => {
		(async () => {
			await tf.ready()
			setIsTfReady(true)
			const model = await mobilenet.load()
			setModel(model)
			setIsModelReady(true)
		})()
	}, [])

	React.useEffect(() => {
		if (image !== null) {
			classifyImage();
		}
	}, [image])

	const classifyImage = React.useCallback(async () => {
		try {
			const imageAssetPath = Image.resolveAssetSource(image!)
			const response: Response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
			const imageDataArrayBuffer = await response.arrayBuffer();
			const imageData = new Uint8Array(imageDataArrayBuffer);
			const imageTensor: tf.Tensor3D = decodeJpeg(imageData);
			const predictions = await model?.classify(imageTensor) as Prediction[]
			setPredictions(predictions)
        } catch (error) {
            console.log(error)
        }
	}, [model, image])

	const selectImage = React.useCallback(async () => {
		try {
			const response = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsEditing: true,
				aspect: [4, 3]
			})
	  
		  	if (!response.canceled) {
				const source = { uri: response.assets?.at(0)?.uri }
				setImage(source)
			}
		} catch (error) {
		  	console.log(error)
		}
	}, [])

	const renderPrediction = React.useCallback((prediction: Prediction): JSX.Element => {
		return (
		  <Text key={prediction.className}>
			{prediction.className}
		  </Text>
		)
	}, [])

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Predict</Text>
			<View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
			<View>
				<Text>
					TFJS ready? 
					{isTfReady ? '✅' : (
						<ActivityIndicator size='small' />
					)}
				</Text>
			</View>
			<View>
				<Text>
					Model ready? 
					{isModelReady ? '✅' : (
						<ActivityIndicator size='small' />
					)}
				</Text>
			</View>
			<TouchableOpacity style={styles.imageWrapper} onPress={isModelReady ? selectImage : undefined}>
				{image && <Image source={image} style={styles.imageContainer} />}
				{isModelReady && !image && (
					<Text style={styles.transparentText}>Tap to choose image</Text>
				)}
			</TouchableOpacity>
			<View style={styles.predictionWrapper}>
				<>
					{isModelReady && image && (
						<Text>
							Predictions: {predictions ? '' : 'Predicting...'}
						</Text>
					)}
					{isModelReady && predictions.length > 0 
						? predictions.map(prediction => renderPrediction(prediction))
						: <Text>Unable to predict 😞</Text>
					}
				</>
			</View>
		</View>
	)
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
	imageWrapper: {
		width: 280,
		height: 280,
		padding: 10,
		borderColor: 'orange',
		borderWidth: 5,
		borderStyle: 'dashed',
		borderRadius: 10,
		marginTop: 40,
		marginBottom: 10,
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center'
	},
	imageContainer: {
		width: 250,
		height: 250,
		position: 'absolute',
		top: 10,
		left: 10,
		bottom: 10,
		right: 10
	},
	predictionWrapper: {
		height: 100,
		width: '100%',
		flexDirection: 'column',
		alignItems: 'center'
	},
	transparentText: {
		color: '#ffffff',
		opacity: 0.7
	},
})
