# Noise generator using html5 canvas

Small project to see if I could write some kind of noise generation algorithm from scratch.

The idea was to work from first principles, and try to make something, regardless of how naive, without reading about how actual noise is generated.

This works, though it is very slow.

## Algorithm

The idea was to create a kind of 'bloom' effect, where random central points are placed and then noise is generated outward from each.

Pseudocode:

```
    // Make anchors
    Generate random anchor points throughout the noise array

    // Bloom out from anchor point
    For each anchor point
        Get its neighbours (top, left, bottom, right)
            For each neighbour
                Generate neighbour's noise value relative to current anchor's noise value
                Make neighbour an anchor itself and add to anchor queu
                Continue
            Loop until no anchor points left

    // Smooth all points
    For each point on screen
        Get its neighbours values
        Compute average of those values
        Set point = average * smoothFactor

    Render all points
                
```

There are some properties that can be used to configure the output

- numAnchors: how many anchors to generate (anchor loop is the bottleneck so higher values will make your browser sad) 
- bloomFactor: controls the gradient between an anchor point and its neighbour
- maxDistance: controls how far out from the initial anchor point a bloom can go
- smoothN: how many smoothing passes to do

## Examples

Here are some maps the algorithm has generated

![1](./maps/1.png)
![2](./maps/2.png)
![3](./maps/3.png)
![4](./maps/4.png)
