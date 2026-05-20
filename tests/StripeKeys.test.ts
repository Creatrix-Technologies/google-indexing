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

  it('saves incomplete keys without activating when an activation checkbox becomes invalid', async () => {
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
            publishableKey: 'pk_live_configured',
            secretKey: 'sk_live_configured',
            webHookSecret: '',
          },
        },
      },
    })
    vi.mocked(api.post).mockResolvedValue({ data: { isSuccess: true } })

    const wrapper = mountPage()
    await flushPromises()

    const liveTab = wrapper.findAll('button.key-tab').find(button => button.text() === 'Live Keys')
    await liveTab?.trigger('click')
    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.find('input[type="text"]').setValue('')

    const saveButton = wrapper.findAll('button').find(button => button.text() === 'Save Live Keys')
    await saveButton?.trigger('click')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/settings/update-stripe-keys', {
      mode: 0,
      keys: {
        publishableKey: '',
        secretKey: 'sk_live_configured',
        webHookSecret: '',
      },
      activateThisMode: false,
    })
  })
})
