import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import mockFetch from './mocks/mockFetch'
import App, {fetchContent} from './App'

const breedsListResponse = {
  message: {
    boxer1: [],
    cattledog: [],
    dalmatian: [],
    husky: [],
  },
}


const dogImagesResponse = {
  message: [
    'https://images.dog.ceo/breeds/cattledog-australian/IMG_1042.jpg',
    'https://images.dog.ceo/breeds/cattledog-australian/IMG_5177.jpg',
  ],
}
beforeEach(() => {
  // jest.spyOn(window, 'fetch').mockImplementation(mockFetch)
  // return jest.fn().mockImplementation(mockFetch)

  // jest.mock('fetch')
  // jest.fn().mockImplementation(mockFetch)
  // const users = [{name: 'Bob'}];
  //   const resp = {data: users};
  //   fetch.get.mockResolvedValue(resp)
  var mock = new MockAdapter(axios)

  mock.onGet('https://dog.ceo/api/breeds/list/all').reply(200, breedsListResponse)
  mock.onGet('https://dog.ceo/api/breed/cattledog/images').reply(200, dogImagesResponse)
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('renders the landing page', async () => {
  render(<App />)

  expect(screen.getByRole('heading')).toHaveTextContent(/Doggy Directory/)
  expect(screen.getByRole('combobox')).toHaveDisplayValue('Select a breed')
  expect(await screen.findByRole('option', {name: 'husky'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Search'})).toBeDisabled()
  expect(screen.getByRole('img')).toBeInTheDocument()
})

test('should be able to search and display dog image results', async () => {
  render(<App />)

  //Simulate selecting an option and verifying its value
  const select = screen.getByRole('combobox')
  expect(await screen.findByRole('option', {name: 'cattledog'})).toBeInTheDocument()
  await userEvent.selectOptions(select, 'cattledog')
  await expect(select).toHaveValue('cattledog')

  //Initiate the search request
  const searchBtn = screen.getByRole('button', {name: 'Search'})
  expect(searchBtn).not.toBeDisabled()
  await userEvent.click(searchBtn)

  //Loading state displays and gets removed once results are displayed
  // await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));

  //Verify image display and results count
  const dogImages = screen.getAllByRole('img')
  await expect(dogImages).toHaveLength(2)
  expect(screen.getByText(/2 Results/i)).toBeInTheDocument()
  expect(dogImages[0]).toHaveAccessibleName('cattledog 1 of 2')
  expect(dogImages[1]).toHaveAccessibleName('cattledog 2 of 2')
})
