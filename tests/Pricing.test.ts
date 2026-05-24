// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Pricing from '../src/pages/Pricing.vue'

vi.mock('../src/api', () => ({
  refreshApi: {
    get: vi.fn(() => Promise.reject(new Error('plans unavailable'))),
  },
}))

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
}

describe('Pricing', () => {
  it('keeps paid signup paths visible when live pricing cannot load', async () => {
    const wrapper = mount(Pricing, {
      global: {
        stubs: {
          ContactForm: true,
          MarketingSiteFooter: true,
          RouterLink: RouterLinkStub,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Unable to load current pricing.')
    expect(wrapper.text()).toContain('Get Solo')
    expect(wrapper.text()).toContain('Get Pro')
    expect(wrapper.text()).toContain('Get Team')
    expect(wrapper.html()).toContain('/signup?plan=solo')
    expect(wrapper.html()).toContain('/signup?plan=pro')
    expect(wrapper.html()).toContain('/signup?plan=team')
  })
})
