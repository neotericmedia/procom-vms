(function () {
    var module,
      __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    module = angular.module('angularBootstrapNavTree', []);

    module.directive('abnTree', [
      '$timeout', function ($timeout) {
          return {
              restrict: 'E',
              template: "<ul class=\"nav nav-list nav-pills nav-stacked abn-tree\">\n  <li ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\" ng-animate=\"'abn-tree-animate'\" ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'') + ' ' +row.classes.join(' ')\" class=\"abn-tree-row\">"
                  + "<a ng-click=\"user_clicks_branch(row.branch, $index);row.branch.expanded = !row.branch.expanded\" data-ng-class='{selected :types[$index].type}'>"
                + "<i ng-class='row.tree_icon' class=\"indented tree-icon\"> </i><span class=\"indented tree-label\" title=\"{{ row.label }}\">{{ row.label }} </span></a></li>\n</ul>"
              //+ "<a ng-click=\"user_clicks_branch(row.branch, $index)\" data-ng-class='{selected :types[$index].type}'>"
              //+ "<i ng-class='row.tree_icon' ng-click=\"row.branch.expanded = !row.branch.expanded\"  class=\"indented tree-icon\"> </i><span ng-click=\"row.branch.expanded = !row.branch.expanded\" class=\"indented tree-label\" title=\"{{ row.label }}\">{{ row.label }} </span></a></li>\n</ul>"
              ,
              replace: true,
              scope: {
                  treeData: '=',
                  onSelect: '&',
                  initialSelection: '@',
                  treeControl: '='
              },
              link: function (scope, element, attrs) {
                  var error, expand_all_parents, expand_level, for_all_ancestors, for_each_branch, get_parent, n, on_treeData_change, select_branch, selected_branch, tree, iconArray = [];
                  error = function (s) {
                      console.log('ERROR:' + s);
                      debugger;
                      return void 0;
                  };

                  // Variables
                  var selectedUID = [];
                  var newIndex = 0;
                  var getChildren = 0;
                  var currentlyExpanding = false;
                  var currentlyCollapsing = false;
                  var originalBranch;
                  var visibleFalse = 0;
                  var deleteIndexAt = 0;
                  var visibleChild = 0;
                  var notVisibleArrayNumber = [];

                  // Intial Startup variables
                  var startUp = true;
                  var lastinvoicerow = 0;
                  var initialPass = false;


                  if (attrs.iconExpand == null) {
                      attrs.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
                  }
                  if (attrs.iconCollapse == null) {
                      attrs.iconCollapse = 'icon-file  glyphicon glyphicon-file  fa fa-file';
                  }
                  if (attrs.iconLeaf == null) {
                      attrs.iconLeaf = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
                  }
                  if (attrs.expandLevel == null) {
                      attrs.expandLevel = '3';
                  }
                  expand_level = parseInt(attrs.expandLevel, 10);
                  if (!scope.treeData) {
                      alert('no treeData defined for the tree!');
                      return;
                  }
                  if (scope.treeData.length == null) {
                      if (treeData.label != null) {
                          scope.treeData = [treeData];
                      } else {
                          alert('treeData should be an array of root branches');
                          return;
                      }
                  }
                  scope.types = [];
                  for_each_branch = function (f) {
                      var do_f, root_branch, _i, _len, _ref, _results;
                      do_f = function (branch, level) {
                          var child, _i, _len, _ref, _results;
                          f(branch, level);
                          if (branch.children != null) {
                              _ref = branch.children;
                              _results = [];
                              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                  child = _ref[_i];
                                  _results.push(do_f(child, level + 1));
                              }
                              return _results;
                          }
                      };
                      _ref = scope.treeData;
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                          root_branch = _ref[_i];
                          _results.push(do_f(root_branch, 1));
                      }
                      return _results;
                  };
                  selected_branch = null;
                  select_branch = function (branch) {
                      if (!branch) {
                          if (selected_branch != null) {
                              selected_branch.selected = false;
                          }
                          selected_branch = null;
                          return;
                      }
                      if (branch !== selected_branch) {
                          if (selected_branch != null) {
                              selected_branch.selected = false;
                          }
                          branch.selected = true;
                          selected_branch = branch;
                          expand_all_parents(branch);

                          if (branch.onSelect != null) {
                              return $timeout(function () {
                                  return branch.onSelect(branch);
                              });
                          } else {
                              if (scope.onSelect != null) {
                                  return $timeout(function () {
                                      return scope.onSelect({
                                          branch: branch
                                      });
                                  });
                              }
                          }
                      }
                  };

                  //ON CLICK
                  scope.user_clicks_branch = function (branch, index) {
                      newIndex = 0;
                      for (i = 0; i < scope.tree_rows.length; i++) {
                          if (branch.uid == scope.tree_rows[i].branch.uid) {
                              newIndex = i;
                          }
                      }
                      if (scope.tree_rows[newIndex].branch.classes == "leaf" && scope.tree_rows[newIndex].branch.children.length == 0) {
                          startUp = false;
                          //leaf gets selected
                          for (i = 0; i < scope.tree_rows.length; i++) {
                              if (scope.tree_rows[i].selector == true) {
                                  scope.tree_rows[i].selector = false;
                              }
                          }
                          scope.types = scope.types.splice(0, scope.tree_rows.length);
                          scope.tree_rows[newIndex].selector = true;


                          if (scope.tree_rows[newIndex].level > 1) {
                              var treeParent = get_parent((scope.tree_rows[newIndex]).branch);


                              while (treeParent.level >= 1) {
                                  //find the source using its branch info
                                  for (var i = 0; i < scope.tree_rows.length; i++) {
                                      if (scope.tree_rows[i].branch.uid == treeParent.uid) {
                                          //found source: scope.tree_rows[i]
                                          scope.tree_rows[i].selector = true;
                                      }
                                  }
                                  //if more than one parent, get the next parent and run recursive 
                                  if (treeParent.level !== 1) {
                                      treeParent = get_parent(treeParent);
                                  }
                                  else {
                                      break;
                                  }
                              }
                          }

                          var iType = -1;
                          selectedUID = [];
                          for (i = 0; i < scope.tree_rows.length; i++) {
                              iType++;
                              if (scope.tree_rows[i].visible == true) {
                                  scope.types[iType].type = scope.tree_rows[i].selector;

                                  //save uid of currently selector true rows
                                  if (scope.types[iType].type == true) {
                                      selectedUID.push(scope.tree_rows[i].branch.uid);
                                  }
                              }
                              else {
                                  iType--;
                              }
                          }
                      }

                      if (!(scope.tree_rows[newIndex].branch.classes == "leaf" && scope.tree_rows[newIndex].branch.children.length == 0)) {
                          startUp = false;
                          //Re-inialize to false all selection values
                          for (i = 0; i < scope.types.length; i++) {
                              if (scope.types[i].type == true) {
                                  scope.types[i].type = false;
                              }
                          }
                          for (i = 0; i < scope.tree_rows.length; i++) {
                              if (scope.tree_rows[i].selector == true) {
                                  scope.tree_rows[i].selector = false;
                              }
                          }

                          //Use selectedUID to give back true value to scope.tree_rows[i].selector
                          for (i = 0; i < scope.tree_rows.length; i++) {
                              for (y = 0; y < selectedUID.length; y++) {
                                  if (selectedUID[y] == scope.tree_rows[i].branch.uid) {
                                      scope.tree_rows[i].selector = true;
                                  }
                              }
                          }

                          //copy all the true and false values into scope.types, under a restriction of only visible rows
                          var iType = -1;
                          for (i = 0; i < scope.tree_rows.length; i++) {
                              iType++;
                              if (scope.tree_rows[i].visible == true) {
                                  scope.types[iType].type = scope.tree_rows[i].selector;
                              }
                              else {
                                  iType--;
                              }
                          }
                          scope.types = scope.types.splice(0, scope.tree_rows.length);

                          //Use branch which comes into the function, and find the clicked value in its position
                          var indexStartTypes = -1;
                          for (i = 0; i < scope.tree_rows.length; i++) {
                              if (scope.tree_rows[i].visible) {
                                  indexStartTypes++;
                              }
                              if (scope.tree_rows[i].branch == branch) {
                                  indexStart = i + 1;
                                  indexStartTypes++;
                                  // i is its position currently before collapse or expansion
                                  // indexStart and indexStartTypes have one more added on to it

                                  if (scope.tree_rows[i].branch.expanded == true) {
                                      //currently expand, means it will collapse

                                      //cut down number of values equal to children from scope.types starting at the clicked on root
                                      originalBranch = branch;
                                      currentlyCollapsing = true;
                                      get_all_children(branch);
                                      currentlyCollapsing = false;
                                      scope.types.splice(indexStartTypes, visibleChild - 1);
                                      visibleChild = 0;
                                  }
                                  else if (scope.tree_rows[i].branch.expanded == false) {
                                      //currently collapsed, means it will expand

                                      originalBranch = branch;
                                      currentlyExpanding = true;
                                      get_all_children(branch);
                                      var children = getChildren;
                                      currentlyExpanding = false;

                                      //All rows previous to the row clicked on added if visible
                                      iType2 = -1;
                                      for (var r = 0; r <= i; r++) {
                                          if (scope.tree_rows[r].visible == true) {
                                              iType2++;
                                              scope.types[iType2].type = scope.tree_rows[r].selector;
                                          }
                                      }

                                      iType2++;
                                      var notVisibleRow = false;
                                      for (var y = 0; y < children ; y++) {
                                          //inserts visible children
                                          for (var k = 0; k < notVisibleArrayNumber.length; k++) {
                                              // in notVisibleArrayNumber every first is the originalBranch on which function gets called, 
                                              // consecutively is the branch that was not visible during collapse among other children
                                              if (scope.tree_rows[y + indexStart].branch.uid == notVisibleArrayNumber[k]) {
                                                  //Row should not be added as it was not visible when the collapse happened
                                                  notVisibleRow = true;
                                              }
                                          }
                                          if (notVisibleRow == false) {
                                              scope.types.splice((iType2), 0, { type: scope.tree_rows[y + indexStart].selector })
                                              iType2++;
                                          }
                                          notVisibleRow = false;
                                      }
                                      notVisibleArrayNumber = [];
                                  }
                                  getChildren = 0;
                                  break;
                              }
                          }
                      }
                      return select_branch(branch);

                  };

                  function get_all_children(branch) {

                      if (currentlyCollapsing) {
                          if (branch == originalBranch) {
                          }
                          //first digit is the uid number of branch,
                          //and next is how many children are visible,
                          //third is how many digits are not visible
                          for (var g = 0; g < scope.tree_rows.length; g++) {
                              if (branch.uid == scope.tree_rows[g].branch.uid) {
                                  getChildren++;
                                  if (scope.tree_rows[g].visible == true) {

                                      visibleChild++;
                                  }
                              }
                          }

                          for (var h = 0; h < branch.children.length; h++) {

                              get_all_children(branch.children[h]);
                          }
                      }
                      else if (currentlyExpanding) {
                          if (branch !== originalBranch) {
                              // check if the child has more than one child and wheather it is collapsed or expanded,
                              // proceed if child is expanded true

                              //and next is how many children are visible,
                              //third is how many digits are not visible

                              //for (var g = 0; g < scope.tree_rows.length; g++) {
                              //    if (branch.uid == scope.tree_rows[g].branch.uid) {
                              //        getChildren++;
                              //        if (scope.tree_rows[g].visible == true) {

                              //            visibleChild++;
                              //        }
                              //    }
                              //}
                              //CHECK PARENTS
                              var isVisible = false;



                              //if (scope.tree_rows[newIndex].level > 1) {
                              var treeParent = get_parent(branch);

                              var endWhile = false;
                              while (treeParent.level >= 1 && endWhile == false) {
                                  //for (var i = 0; i < scope.tree_rows.length; i++) {
                                  //if (scope.tree_rows[i].branch.uid == treeParent.uid) {
                                  if (treeParent == originalBranch) {
                                      //if parent is the original branch, direct parent, then its visible
                                      isVisible = true;
                                      endWhile = true;
                                  }
                                  else if (treeParent.expanded == true) {
                                      //if not direct parent, but the parent is fully expanded, continue to cycle through parents in case
                                      isVisible = true;
                                  }
                                  else {
                                      //if parent is collapsed, so no need to loop further, dont show this value
                                      isVisible = false;
                                      endWhile = true;
                                  }
                                  if (endWhile == false) {
                                      treeParent = get_parent(treeParent);
                                  }
                                  //if more than one parent, get the next parent and run recursive 
                              }

                              if (isVisible) {
                                  getChildren++;

                              }
                              else {
                                  getChildren++;
                                  notVisibleArrayNumber.push(branch.uid);
                              }

                              //    if ((branch.children.length == 0) || (branch.children.length > 0 && branch.expanded == true)) {
                              //        getChildren++;
                              //    }
                              //    else if (branch.children.length > 0 && branch.expanded == false) {
                              //        //stop here and don't add any children that may be contained inside of this folder
                              //        getChildren++;
                              //        for (var h = 0; h < branch.children.length; h++) {
                              //            notVisibleArrayNumber.push(branch.uid);
                              //        }
                              //    }
                              //}
                              ////recurse onto each child
                          }
                          for (var h = 0; h < branch.children.length; h++) {

                              get_all_children(branch.children[h]);
                          }

                      }

                  }
                  get_parent = function (child) {
                      var parent;
                      parent = void 0;
                      if (child.parent_uid) {
                          for_each_branch(function (b) {
                              if (b.uid === child.parent_uid) {
                                  return parent = b;
                              }
                          });
                      }
                      return parent;
                  };
                  for_all_ancestors = function (child, fn) {
                      var parent;
                      parent = get_parent(child);
                      if (parent != null) {
                          fn(parent);
                          return for_all_ancestors(parent, fn);
                      }
                  };
                  expand_all_parents = function (child) {
                      return for_all_ancestors(child, function (b) {
                          return b.expanded = true;

                      });
                  };
                  scope.tree_rows = [];
                  on_treeData_change = function () {
                      var add_branch_to_list, root_branch, _i, _len, _ref, _results;
                      for_each_branch(function (b, level) {
                          if (!b.uid) {
                              return b.uid = "" + Math.random();
                          }
                      });
                      console.log('UIDs are set.');
                      for_each_branch(function (b) {
                          var child, _i, _len, _ref, _results;
                          if (angular.isArray(b.children)) {
                              _ref = b.children;
                              _results = [];
                              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                  child = _ref[_i];
                                  _results.push(child.parent_uid = b.uid);
                              }
                              return _results;
                          }
                      });
                      scope.tree_rows = [];
                      for_each_branch(function (branch) {
                          var child, f;
                          if (branch.children) {
                              if (branch.children.length > 0) {
                                  f = function (e) {
                                      if (typeof e === 'string') {
                                          return {
                                              label: e,
                                              children: []
                                          };
                                      } else {
                                          return e;
                                      }
                                  };
                                  return branch.children = (function () {
                                      var _i, _len, _ref, _results;
                                      _ref = branch.children;
                                      _results = [];
                                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                          child = _ref[_i];
                                          _results.push(f(child));
                                      }
                                      return _results;
                                  })();
                              }
                          } else {
                              return branch.children = [];
                          }
                      });
                      add_branch_to_list = function (level, branch, visible) {
                          var child, child_visible, tree_icon, _i, _len, _ref, _results;
                          if (branch.expanded == null) {
                              branch.expanded = false;
                          }
                          if (branch.classes == null) {
                              branch.classes = [];
                          }
                          if (!branch.noLeaf && (!branch.children || branch.children.length === 0)) {
                              tree_icon = attrs.iconLeaf;
                              if (__indexOf.call(branch.classes, "leaf") < 0) {
                                  branch.classes.push("leaf");
                              }
                          } else {
                              if (branch.expanded) {
                                  tree_icon = attrs.iconCollapse;
                              } else {
                                  tree_icon = attrs.iconExpand;
                              }
                          }
                          if (level == 1) {
                              tree_icon = "";
                          }

                          var selector = false;

                          scope.types.push({ type: false });

                          scope.tree_rows.push({
                              level: level,
                              branch: branch,
                              label: branch.label,
                              classes: branch.classes,
                              selector: selector,
                              tree_icon: tree_icon,
                              visible: visible
                          });


                          if (startUp) {
                              if (initialPass == false) {
                                  for (var i = 0; i < scope.tree_rows.length; i++) {
                                      var n = (scope.tree_rows[i].label).localeCompare("Timesheets");
                                      if (n == 0) {
                                          lastinvoicerow = i - 1;
                                          //Selection moved to Standard from Courtesy Copy>
                                          if ((scope.tree_rows[lastinvoicerow].label).localeCompare("Courtesy Copy") == 0) {
                                              lastinvoicerow = i - 2;
                                          }
                                          //<Selection change
                                          initialPass = true;
                                          break;
                                      }
                                      else if (i == scope.tree_rows.length - 1) {
                                          lastinvoicerow = i;
                                          //Selection moved to Standard from Courtesy Copy>
                                          if ((scope.tree_rows[lastinvoicerow].label).localeCompare("Courtesy Copy") == 0) {
                                              lastinvoicerow = i - 1;
                                          }
                                          //<Selection change
                                          break;
                                      }

                                  }

                                  for (var i = 0; i < scope.tree_rows.length; i++) {
                                      scope.tree_rows[i].selector = false;
                                      scope.types[i].type = false;
                                  }

                                  //Gets parents and gives them selected value of true
                                  if (scope.tree_rows[lastinvoicerow].branch.classes == "leaf" && scope.tree_rows[lastinvoicerow].branch.children.length == 0) {
                                      //leaf gets selected
                                      scope.tree_rows[lastinvoicerow].selector = true;
                                      selectedUID = [];
                                      selectedUID.push(scope.tree_rows[lastinvoicerow].branch.uid);
                                      //erase temp after
                                      var temp = true;
                                      if (scope.tree_rows[lastinvoicerow].level > 1) {
                                          var intialtreeparent = get_parent((scope.tree_rows[lastinvoicerow]).branch);
                                          while (intialtreeparent.level >= 1 && temp == true) {
                                              //find source using branch
                                              for (i = 0; i < scope.tree_rows.length; i++) {
                                                  if (scope.tree_rows[i].branch.uid == intialtreeparent.uid) {
                                                      //found source
                                                      scope.tree_rows[i].selector = true;
                                                      selectedUID.push(scope.tree_rows[i].branch.uid);
                                                  }
                                              }
                                              //if more than one parent, get the next parent and run recursive
                                              if (intialtreeparent.level !== 1) {
                                                  intialtreeparent = get_parent(intialtreeparent);
                                              }
                                              else {
                                                  temp = false;
                                              }
                                          }
                                      }
                                  }

                                  for (var i = 0; i < scope.tree_rows.length; i++) {
                                      scope.types[i].type = scope.tree_rows[i].selector;
                                  }

                              }
                          }
                          if (branch.children != null) {
                              _ref = branch.children;
                              _results = [];
                              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                  child = _ref[_i];
                                  child_visible = visible && branch.expanded;
                                  _results.push(add_branch_to_list(level + 1, child, child_visible));
                              }
                              return _results;
                          }
                      };
                      _ref = scope.treeData;
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                          root_branch = _ref[_i];
                          _results.push(add_branch_to_list(1, root_branch, true));
                      }
                      return _results;
                  };
                  scope.$watch('treeData', on_treeData_change, true);
                  if (attrs.initialSelection != null) {
                      for_each_branch(function (b) {
                          if (b.label === attrs.initialSelection) {
                              return $timeout(function () {
                                  return select_branch(b);
                              });
                          }
                      });
                  }
                  n = scope.treeData.length;
                  console.log('num root branches = ' + n);
                  for_each_branch(function (b, level) {
                      b.level = level;
                      return b.expanded = b.level < expand_level;
                  });
                  if (scope.treeControl != null) {
                      if (angular.isObject(scope.treeControl)) {
                          tree = scope.treeControl;
                          tree.expand_all = function () {
                              return for_each_branch(function (b, level) {
                                  return b.expanded = true;
                              });
                          };
                          tree.collapse_all = function () {
                              return for_each_branch(function (b, level) {
                                  return b.expanded = false;
                              });
                          };
                          tree.get_first_branch = function () {
                              n = scope.treeData.length;
                              if (n > 0) {
                                  return scope.treeData[0];
                              }
                          };
                          tree.select_first_branch = function () {
                              var b;
                              b = tree.get_first_branch();
                              return tree.select_branch(b);
                          };
                          tree.get_selected_branch = function () {
                              return selected_branch;
                          };
                          tree.get_parent_branch = function (b) {
                              return get_parent(b);
                          };
                          tree.select_branch = function (b) {
                              select_branch(b);
                              return b;
                          };
                          tree.get_children = function (b) {
                              return b.children;
                          };
                          tree.select_parent_branch = function (b) {
                              var p;
                              if (b == null) {
                                  b = tree.get_selected_branch();
                              }
                              if (b != null) {
                                  p = tree.get_parent_branch(b);
                                  if (p != null) {
                                      tree.select_branch(p);
                                      return p;
                                  }
                              }
                          };
                          tree.add_branch = function (parent, new_branch) {
                              if (parent != null) {
                                  parent.children.push(new_branch);
                                  parent.expanded = true;
                              } else {
                                  scope.treeData.push(new_branch);
                              }
                              return new_branch;
                          };
                          tree.add_root_branch = function (new_branch) {
                              tree.add_branch(null, new_branch);
                              return new_branch;
                          };
                          tree.expand_branch = function (b) {
                              if (b == null) {
                                  b = tree.get_selected_branch();
                              }
                              if (b != null) {
                                  b.expanded = true;
                                  return b;
                              }
                          };
                          tree.collapse_branch = function (b) {
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  b.expanded = false;
                                  return b;
                              }
                          };
                          tree.get_siblings = function (b) {
                              var p, siblings;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  p = tree.get_parent_branch(b);
                                  if (p) {
                                      siblings = p.children;
                                  } else {
                                      siblings = scope.treeData;
                                  }
                                  return siblings;
                              }
                          };
                          tree.get_next_sibling = function (b) {
                              var i, siblings;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  siblings = tree.get_siblings(b);
                                  n = siblings.length;
                                  i = siblings.indexOf(b);
                                  if (i < n) {
                                      return siblings[i + 1];
                                  }
                              }
                          };
                          tree.get_prev_sibling = function (b) {
                              var i, siblings;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              siblings = tree.get_siblings(b);
                              n = siblings.length;
                              i = siblings.indexOf(b);
                              if (i > 0) {
                                  return siblings[i - 1];
                              }
                          };
                          tree.select_next_sibling = function (b) {
                              var next;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  next = tree.get_next_sibling(b);
                                  if (next != null) {
                                      return tree.select_branch(next);
                                  }
                              }
                          };
                          tree.select_prev_sibling = function (b) {
                              var prev;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  prev = tree.get_prev_sibling(b);
                                  if (prev != null) {
                                      return tree.select_branch(prev);
                                  }
                              }
                          };
                          tree.get_first_child = function (b) {
                              var _ref;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                                      return b.children[0];
                                  }
                              }
                          };
                          tree.get_closest_ancestor_next_sibling = function (b) {
                              var next, parent;
                              next = tree.get_next_sibling(b);
                              if (next != null) {
                                  return next;
                              } else {
                                  parent = tree.get_parent_branch(b);
                                  return tree.get_closest_ancestor_next_sibling(parent);
                              }
                          };
                          tree.get_next_branch = function (b) {
                              var next;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  next = tree.get_first_child(b);
                                  if (next != null) {
                                      return next;
                                  } else {
                                      next = tree.get_closest_ancestor_next_sibling(b);
                                      return next;
                                  }
                              }
                          };
                          tree.select_next_branch = function (b) {
                              var next;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  next = tree.get_next_branch(b);
                                  if (next != null) {
                                      tree.select_branch(next);
                                      return next;
                                  }
                              }
                          };
                          tree.last_descendant = function (b) {
                              var last_child;
                              if (b == null) {
                                  debugger;
                              }
                              n = b.children.length;
                              if (n === 0) {
                                  return b;
                              } else {
                                  last_child = b.children[n - 1];
                                  return tree.last_descendant(last_child);
                              }
                          };
                          tree.get_prev_branch = function (b) {
                              var parent, prev_sibling;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  prev_sibling = tree.get_prev_sibling(b);
                                  if (prev_sibling != null) {
                                      return tree.last_descendant(prev_sibling);
                                  } else {
                                      parent = tree.get_parent_branch(b);
                                      return parent;
                                  }
                              }
                          };
                          return tree.select_prev_branch = function (b) {
                              var prev;
                              if (b == null) {
                                  b = selected_branch;
                              }
                              if (b != null) {
                                  prev = tree.get_prev_branch(b);
                                  if (prev != null) {
                                      tree.select_branch(prev);
                                      return prev;
                                  }
                              }
                          };
                      }
                  }
              }
          };
      }
    ]);

}).call(this);
