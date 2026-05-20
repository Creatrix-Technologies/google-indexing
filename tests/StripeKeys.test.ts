// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StripeKeys from '../src/pages/StripeKeys.vue'
import api from '../src/api'

vi.mock('../src/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
  }),
}))

const mountPage = () =>
  mount(StripeKeys, {
    global: {
      stubs: {
        SettingsLayout: { template: '<div><slot /></div>' },
      },
    },
  })

describe('StripeKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not enable Live mode when the live secret key has no publishable key', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: {
          activeModeName: 'Sandbox',
          sandbox: {
            publishableKey: 'pk_test_configured',
            secretKey: 'sk_test_configured',
            webHookSecret: '',
          },
          live: {
            publishableKey: '',
            secretKey: 'sk_live_configured',
            webHookSecret: '',
          },
        },
      },
    })

    const wrapper = mountPage()
    await flushPromises()

    const liveButton = wrapper.findAll('button.mode-btn').find(button => button.text().includes('Live'))
    expect(liveButton?.attributes('disabled')).toBeDefined()
  })
})
