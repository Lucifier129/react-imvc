import Controller from '../../../../src/controller'
import connect from '../../../../src/hoc/connect'
import React from 'react'
import { Location, Context } from '../../../../src/type'
export default class extends Controller<{}, {}, typeof View> {
	// SSR = true // enable server side rendering
	View = View
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

const withLocation = connect(() => {
  return {
    location: 'test'
  }
})

export interface Props {
  location: string
}

const LocationComponent = ({ location }: Props) => {
  return <div id="location">{ location }</div>
}

const WithLocationComponent = withLocation(LocationComponent)

function View() {
	return <div id="connect">
    <WithLocationComponent></WithLocationComponent>
  </div>
}
