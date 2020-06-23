import { mxClient } from '@mxgraph/mxClient';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxCellRenderer } from '@mxgraph/view/mxCellRenderer';
import { mxCodecRegistry } from '@mxgraph/io/mxCodecRegistry';
import { mxChildChangeCodec } from '@mxgraph/io/mxChildChangeCodec';
import { mxCellCodec } from '@mxgraph/io/mxCellCodec';
import { mxDefaultKeyHandlerCodec } from '@mxgraph/io/mxDefaultKeyHandlerCodec';
import { mxDefaultPopupMenuCodec } from '@mxgraph/io/mxDefaultPopupMenuCodec';
import { mxDefaultToolbarCodec } from '@mxgraph/io/mxDefaultToolbarCodec';
import { mxEditorCodec } from '@mxgraph/io/mxEditorCodec';
import { mxGenericChangeCodec } from '@mxgraph/io/mxGenericChangeCodec';
import { mxGraphCodec } from '@mxgraph/io/mxGraphCodec';
import { mxGraphViewCodec } from '@mxgraph/io/mxGraphViewCodec';
import { mxModelCodec } from '@mxgraph/io/mxModelCodec';
import { mxRootChangeCodec } from '@mxgraph/io/mxRootChangeCodec';
import { mxStylesheetCodec } from '@mxgraph/io/mxStylesheetCodec';
import { mxTerminalChangeCodec } from '@mxgraph/io/mxTerminalChangeCodec';
import { mxCylinder } from '@mxgraph/shape/mxCylinder';
import { mxRhombus } from '@mxgraph/shape/mxRhombus';
import { mxEllipse } from '@mxgraph/shape/mxEllipse';
import { mxSwimlane } from '@mxgraph/shape/mxSwimlane';
import { mxDoubleEllipse } from '@mxgraph/shape/mxDoubleEllipse';
import { mxArrowConnector } from '@mxgraph/shape/mxArrowConnector';
import { mxArrow } from '@mxgraph/shape/mxArrow';
import { mxLine } from '@mxgraph/shape/mxLine';
import { mxCloud } from '@mxgraph/shape/mxCloud';
import { mxHexagon } from '@mxgraph/shape/mxHexagon';
import { mxTriangle } from '@mxgraph/shape/mxTriangle';
import { mxActor } from '@mxgraph/shape/mxActor';
import { mxLabel } from '@mxgraph/shape/mxLabel';
import { mxCellAttributeChange } from '@mxgraph/model/changes/mxCellAttributeChange';
import { mxVisibleChange } from '@mxgraph/model/changes/mxVisibleChange';
import { mxCollapseChange } from '@mxgraph/model/changes/mxCollapseChange';
import { mxGeometryChange } from '@mxgraph/model/changes/mxGeometryChange';
import { mxStyleChange } from '@mxgraph/model/changes/mxStyleChange';
import { mxValueChange } from '@mxgraph/model/changes/mxValueChange';
import { mxMarker, diamond, createOpenArrow, createArrow, oval } from '@mxgraph/shape/mxMarker';
import { mxPerimeter } from '@mxgraph/view/mxPerimeter';
import { mxEdgeStyle } from '@mxgraph/view/mxEdgeStyle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxStyleRegistry } from '@mxgraph/view/mxStyleRegistry';
import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxConnector } from '@mxgraph/shape/mxConnector';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';

export function bootstrap() {
  // mxClient
  if (typeof window.mxLoadResources == 'undefined') {
    window.mxLoadResources = true;
  }

  if (typeof window.mxForceIncludes == 'undefined') {
    window.mxForceIncludes = false;
  }

  if (typeof window.mxResourceExtension == 'undefined') {
    mxResources.extension = '.txt';
  }

  if (typeof window.mxLoadStylesheets == 'undefined') {
    window.mxLoadStylesheets = true;
  }

  if (typeof window.mxBasePath != 'undefined' && window.mxBasePath.length > 0) {
    if (window.mxBasePath.substring(window.mxBasePath.length - 1) == '/') {
      window.mxBasePath = window.mxBasePath.substring(0, window.mxBasePath.length - 1);
    }

    mxClient.basePath = window.mxBasePath;
  } else {
    mxClient.basePath = '.';
  }

  if (typeof window.mxImageBasePath != 'undefined' && window.mxImageBasePath.length > 0) {
    if (window.mxImageBasePath.substring(window.mxImageBasePath.length - 1) == '/') {
      window.mxImageBasePath = window.mxImageBasePath.substring(0, window.mxImageBasePath.length - 1);
    }

    mxClient.imageBasePath = window.mxImageBasePath;
  } else {
    mxClient.imageBasePath = mxClient.basePath + '/images';
  }

  if (typeof window.mxLanguage != 'undefined' && window.mxLanguage != null) {
    mxClient.language = window.mxLanguage;
  } else {
    mxClient.language = mxClient.IS_IE ? navigator.userLanguage : navigator.language;
  }

  if (typeof window.mxDefaultLanguage != 'undefined' && window.mxDefaultLanguage != null) {
    mxClient.defaultLanguage = window.mxDefaultLanguage;
  } else {
    mxClient.defaultLanguage = 'en';
  }

  if (window.mxLoadStylesheets) {
    mxClient.link('stylesheet', mxClient.basePath + '/css/common.css');
  }

  if (typeof mxLanguages != 'undefined' && window.mxLanguages != null) {
    mxClient.languages = window.mxLanguages;
  }

  if (mxClient.IS_VML) {
    if (mxClient.IS_SVG) {
      mxClient.IS_VML = false;
    } else {
      if (document.namespaces != null) {
        if (document.documentMode == 8) {
          document.namespaces.add(mxClient.VML_PREFIX, 'urn:schemas-microsoft-com:vml', '#default#VML');
          document.namespaces.add(mxClient.OFFICE_PREFIX, 'urn:schemas-microsoft-com:office:office', '#default#VML');
        } else {
          document.namespaces.add(mxClient.VML_PREFIX, 'urn:schemas-microsoft-com:vml');
          document.namespaces.add(mxClient.OFFICE_PREFIX, 'urn:schemas-microsoft-com:office:office');
        }
      }

      if (mxClient.IS_QUIRKS && document.styleSheets.length >= 30) {
        (function () {
          var node = document.createElement('style');
          node.type = 'text/css';
          node.styleSheet.cssText =
            mxClient.VML_PREFIX +
            '\\:*{behavior:url(#default#VML)}' +
            mxClient.OFFICE_PREFIX +
            '\\:*{behavior:url(#default#VML)}';
          document.getElementsByTagName('head')[0].appendChild(node);
        })();
      } else {
        document.createStyleSheet().cssText =
          mxClient.VML_PREFIX +
          '\\:*{behavior:url(#default#VML)}' +
          mxClient.OFFICE_PREFIX +
          '\\:*{behavior:url(#default#VML)}';
      }

      if (window.mxLoadStylesheets) {
        mxClient.link('stylesheet', mxClient.basePath + '/css/explorer.css');
      }
    }
  }

  // mxEditor
  if (window.mxLoadResources) {
    mxResources.add(mxClient.basePath + '/resources/editor');
  } else {
    mxClient.defaultBundles.push(mxClient.basePath + '/resources/editor');
  }

  // mxGraph
  if (window.mxLoadResources) {
    mxResources.add(mxClient.basePath + '/resources/graph');
  } else {
    mxClient.defaultBundles.push(mxClient.basePath + '/resources/graph');
  }

  // mxMarker
  mxMarker.addMarker('classic', createArrow(2));
  mxMarker.addMarker('classicThin', createArrow(3));
  mxMarker.addMarker('block', createArrow(2));
  mxMarker.addMarker('blockThin', createArrow(3));

  mxMarker.addMarker('open', createOpenArrow(2));
  mxMarker.addMarker('openThin', createOpenArrow(3));
  mxMarker.addMarker('oval', oval);

  mxMarker.addMarker('diamond', diamond);
  mxMarker.addMarker('diamondThin', diamond);

  // mxCellRenderer
  mxCellRenderer.registerShape(mxConstants.SHAPE_RECTANGLE, mxRectangleShape);
  mxCellRenderer.registerShape(mxConstants.SHAPE_ELLIPSE, mxEllipse);
  mxCellRenderer.registerShape(mxConstants.SHAPE_RHOMBUS, mxRhombus);
  mxCellRenderer.registerShape(mxConstants.SHAPE_CYLINDER, mxCylinder);
  mxCellRenderer.registerShape(mxConstants.SHAPE_CONNECTOR, mxConnector);
  mxCellRenderer.registerShape(mxConstants.SHAPE_ACTOR, mxActor);
  mxCellRenderer.registerShape(mxConstants.SHAPE_TRIANGLE, mxTriangle);
  mxCellRenderer.registerShape(mxConstants.SHAPE_HEXAGON, mxHexagon);
  mxCellRenderer.registerShape(mxConstants.SHAPE_CLOUD, mxCloud);
  mxCellRenderer.registerShape(mxConstants.SHAPE_LINE, mxLine);
  mxCellRenderer.registerShape(mxConstants.SHAPE_ARROW, mxArrow);
  mxCellRenderer.registerShape(mxConstants.SHAPE_ARROW_CONNECTOR, mxArrowConnector);
  mxCellRenderer.registerShape(mxConstants.SHAPE_DOUBLE_ELLIPSE, mxDoubleEllipse);
  mxCellRenderer.registerShape(mxConstants.SHAPE_SWIMLANE, mxSwimlane);
  mxCellRenderer.registerShape(mxConstants.SHAPE_IMAGE, mxImageShape);
  mxCellRenderer.registerShape(mxConstants.SHAPE_LABEL, mxLabel);

  // codec registry
  mxCodecRegistry.register(new mxChildChangeCodec());
  mxCodecRegistry.register(new mxCellCodec());
  mxCodecRegistry.register(new mxDefaultKeyHandlerCodec());
  mxCodecRegistry.register(new mxDefaultPopupMenuCodec());
  mxCodecRegistry.register(new mxDefaultToolbarCodec());
  mxCodecRegistry.register(new mxEditorCodec());

  mxCodecRegistry.register(new mxGenericChangeCodec(new mxValueChange(), 'value'));
  mxCodecRegistry.register(new mxGenericChangeCodec(new mxStyleChange(), 'style'));
  mxCodecRegistry.register(new mxGenericChangeCodec(new mxGeometryChange(), 'geometry'));
  mxCodecRegistry.register(new mxGenericChangeCodec(new mxCollapseChange(), 'collapsed'));
  mxCodecRegistry.register(new mxGenericChangeCodec(new mxVisibleChange(), 'visible'));
  mxCodecRegistry.register(new mxGenericChangeCodec(new mxCellAttributeChange(), 'value'));

  mxCodecRegistry.register(new mxGraphCodec());
  mxCodecRegistry.register(new mxGraphViewCodec());
  mxCodecRegistry.register(new mxModelCodec());
  mxCodecRegistry.register(new mxRootChangeCodec());
  mxCodecRegistry.register(new mxStylesheetCodec());
  mxCodecRegistry.register(new mxTerminalChangeCodec());

  // mxStyleRegistry
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_ELBOW, mxEdgeStyle.ElbowConnector);
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_ENTITY_RELATION, mxEdgeStyle.EntityRelation);
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_LOOP, mxEdgeStyle.Loop);
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_SIDETOSIDE, mxEdgeStyle.SideToSide);
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_TOPTOBOTTOM, mxEdgeStyle.TopToBottom);
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_ORTHOGONAL, mxEdgeStyle.OrthConnector);
  mxStyleRegistry.putValue(mxConstants.EDGESTYLE_SEGMENT, mxEdgeStyle.SegmentConnector);
  mxStyleRegistry.putValue(mxConstants.PERIMETER_ELLIPSE, mxPerimeter.EllipsePerimeter);
  mxStyleRegistry.putValue(mxConstants.PERIMETER_RECTANGLE, mxPerimeter.RectanglePerimeter);
  mxStyleRegistry.putValue(mxConstants.PERIMETER_RHOMBUS, mxPerimeter.RhombusPerimeter);
  mxStyleRegistry.putValue(mxConstants.PERIMETER_TRIANGLE, mxPerimeter.TrianglePerimeter);
  mxStyleRegistry.putValue(mxConstants.PERIMETER_HEXAGON, mxPerimeter.HexagonPerimeter);
}
