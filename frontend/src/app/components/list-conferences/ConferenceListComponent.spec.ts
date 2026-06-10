// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConferenceListComponent from './ConferenceListComponent.vue'
import type { Conference } from '../../../domain/conferences/Conference.js'

const conferences: Conference[] = [
  { name: 'Devoxx France' },
  { name: 'Nantes JUG' },
  { name: 'BDX I/O' },
]

describe('ConferenceListComponent', () => {
  it('should render one item per conference', () => {
    const wrapper = mount(ConferenceListComponent, {
      props: { conferences },
    })

    expect(wrapper.findAll('li')).toHaveLength(3)
  })

  it('should display conference names', () => {
    const wrapper = mount(ConferenceListComponent, {
      props: { conferences },
    })

    const items = wrapper.findAll('li').map(li => li.text())
    expect(items).toEqual(['Devoxx France', 'Nantes JUG', 'BDX I/O'])
  })

  it('should render an empty list when no conferences', () => {
    const wrapper = mount(ConferenceListComponent, {
      props: { conferences: [] },
    })

    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
