#include "shadowmap_render.h"

#include <etna/Etna.hpp>

#include "render/ImGuiRender.h"


SimpleShadowmapRender::SimpleShadowmapRender(glm::uvec2 res) : resolution{res}
{
  m_uniforms.baseColor = {0.9f, 0.92f, 1.0f};
}

void SimpleShadowmapRender::initVulkan(std::span<const char*> instance_extensions)
{
  std::vector<const char*> m_instanceExtensions;

  for (auto ext : instance_extensions)
    m_instanceExtensions.push_back(ext);

  #ifndef NDEBUG
    m_instanceExtensions.push_back("VK_EXT_debug_report");
  #endif

  std::vector<const char*> m_deviceExtensions;

  m_deviceExtensions.push_back(VK_KHR_SWAPCHAIN_EXTENSION_NAME);

  etna::initialize(etna::InitParams
    {
      .applicationName = "ShadowmapSample",
      .applicationVersion = VK_MAKE_VERSION(0, 1, 0),
      .instanceExtensions = m_instanceExtensions,
      .deviceExtensions = m_deviceExtensions,
      .features = vk::PhysicalDeviceFeatures2
        {
          .features = m_enabledDeviceFeatures
        },
      // Replace with an index if etna detects your preferred GPU incorrectly
      .physicalDeviceIndexOverride = {},
      // How much frames we buffer on the GPU without waiting for their completion on the CPU
      .numFramesInFlight = 2
    });

  m_context = &etna::get_context();

  m_pScnMgr = std::make_shared<SceneManager>(
    m_context->getDevice(), m_context->getPhysicalDevice(),
    m_context->getQueueFamilyIdx(), m_context->getQueueFamilyIdx(), false);
}

void SimpleShadowmapRender::RecreateSwapChain()
{
  ETNA_CHECK_VK_RESULT(m_context->getDevice().waitIdle());

  auto[w, h] = window->recreateSwapchain();
  resolution = {w, h};

  // Most resources depend on the current resolution, so we recreate them.
  AllocateResources();

  // NOTE: if swapchain changes format (that can happen on android), we will die here.
  // not that we actually care about android or anything.
}

SimpleShadowmapRender::~SimpleShadowmapRender()
{
  ETNA_CHECK_VK_RESULT(m_context->getDevice().waitIdle());
}
