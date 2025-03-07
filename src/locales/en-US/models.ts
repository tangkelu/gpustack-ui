export default {
  'models.button.deploy': 'Deploy Model',
  'models.title': 'Models',
  'models.title.edit': 'Edit Model',
  'models.table.models': 'models',
  'models.table.name': 'Model Name',
  'models.form.source': 'Source',
  'models.form.repoid': 'Repo ID',
  'models.form.repoid.desc': 'Only .gguf format is supported',
  'models.form.filename': 'File Name',
  'models.form.replicas': 'Replicas',
  'models.form.selector': 'Selector',
  'models.form.configurations': 'Configurations',
  'models.form.s3address': 'S3 Address',
  'models.form.partialoffload.tips':
    'After enabling CPU offloading, GPUStack prioritizes loading as many layers as possible onto the GPU to maximize performance. If GPU resources are limited, some layers will be offloaded to the CPU, with full CPU inference used only when no GPU is available.',
  'models.form.distribution.tips':
    'Allows for offloading part of the computation to single or multiple remote workers when the resources of a single GPU or worker are insufficient.',
  'models.openinplayground': 'Open in Playground',
  'models.instances': 'instances',
  'models.table.replicas.edit': 'Edit Replicas',
  'model.form.ollama.model': 'Ollama Model',
  'model.form.ollamaholder': 'Please select or input model name',
  'model.deploy.sort': 'Sort',
  'model.deploy.search.placeholder': 'Search models from {source}',
  'model.form.ollamatips':
    'Tip: The following are the preconfigured Ollama models in GPUStack. Please select the model you want, or directly enter the model you wish to deploy in the 【{name}】 input box on the right.',
  'models.sort.name': 'Name',
  'models.sort.size': 'Size',
  'models.sort.likes': 'Likes',
  'models.sort.trending': 'Trending',
  'models.sort.downloads': 'Downloads',
  'models.sort.updated': 'Updated',
  'models.search.result': '{count} results',
  'models.data.card': 'Model Card',
  'models.available.files': 'Available Files',
  'models.viewin.hf': 'View in Hugging Face',
  'models.viewin.modelscope': 'View in ModelScope',
  'models.architecture': 'Architecture',
  'models.search.noresult': 'No related models found',
  'models.search.nofiles': 'No available files',
  'models.search.networkerror': 'Network connection exception!',
  'models.search.hfvisit': 'Please make sure you can visit',
  'models.search.unsupport':
    'This model is not supported and may be unusable after deployment.',
  'models.form.scheduletype': 'Schedule Type',
  'models.form.categories': 'Model Category',
  'models.form.scheduletype.auto': 'Auto',
  'models.form.scheduletype.manual': 'Manual',
  'models.form.scheduletype.auto.tips':
    'Automatically deploys model instances to appropriate GPUs/Workers based on current resource conditions.',
  'models.form.scheduletype.manual.tips':
    'Allows you to manually specify the GPUs/Workers to deploy the model instances to.',
  'models.form.manual.schedule': 'Manual Schedule',
  'models.table.gpuindex': 'GPU Index',
  'models.table.backend': 'Backends',
  'models.table.acrossworker': 'Distributed Across Workers',
  'models.table.cpuoffload': 'CPU Offload',
  'models.table.layers': 'Layers',
  'models.form.backend': 'Backend',
  'models.form.backend_parameters': 'Backend Parameters',
  'models.search.gguf.tips':
    'GGUF models use llama-box(supports Linux, macOS and Windows).',
  'models.search.vllm.tips':
    'Non-GGUF models use vox-box for audio and vLLM(x86 Linux only) for others.',
  'models.search.voxbox.tips':
    'To deploy an audio model, uncheck the GGUF checkbox.',
  'models.form.ollamalink': 'Find More in Ollama Library',
  'models.form.backend_parameters.llamabox.placeholder':
    'e.g., --ctx-size=8192',
  'models.form.backend_parameters.vllm.placeholder':
    'e.g., --max-model-len=8192',
  'models.form.backend_parameters.vllm.tips':
    'More {backend} parameter details',
  'models.logs.pagination.prev': 'Previous {lines} Lines',
  'models.logs.pagination.next': 'Next {lines} Lines',
  'models.logs.pagination.last': 'Last Page',
  'models.logs.pagination.first': 'First Page',
  'models.form.localPath': 'Local Path',
  'models.form.filePath': 'Model Path',
  'models.form.backendVersion': 'Backend Version',
  'models.form.backendVersion.tips':
    'Pin a specific version to keep the backend stable across GPUStack upgrades.',
  'models.form.gpuselector': 'GPU Selector',
  'models.form.backend.llamabox':
    'For GGUF format models, supports Linux, macOS, and Windows.',
  'models.form.backend.vllm':
    'For non-GGUF format models, supports x86 Linux only.',
  'models.form.backend.voxbox': 'For non-GGUF format audio models.',
  'models.form.search.gguftips':
    'If using macOS or Windows as a worker, check GGUF (uncheck for audio models).',
  'models.form.button.addlabel': 'Add Label',
  'models.filter.category': 'Filter by category',
  'models.list.more.logs': 'View More',
  'models.catalog.release.date': 'Release Date',
  'models.localpath.gguf.tips.title': 'GGUF format model',
  'models.localpat.safe.tips.title': 'Safetensors format model',
  'models.localpath.shared.tips.title': 'Sharded GGUF Format Model',
  'models.localpath.gguf.tips':
    ' Specify the model file, e.g., /usr/local/models/model.gguf.',
  'models.localpath.safe.tips':
    'Specify the model directory that contains .safetensors and config.json files, e.g., /usr/local/models/model/.',
  'models.localpath.chunks.tips': `Specify the first shard file of the model, e.g., /usr/local/models/model-00001-of-00004.gguf.`
};
